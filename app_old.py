import os
import psycopg2
import pandas as pd
import numpy as np
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from flask import Flask, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import inspect

# print (os.environ)
if not os.environ.get('DYNO'):
    import config
    print(config.name)
    
if os.environ.get("DATABASE_URL"):
    url=os.environ["DATABASE_URL"]
else:
    url = config.url

engine= sqlalchemy.create_engine(url)
# engine = sqlalchemy.create_engine("sqlite:///Data/Sqlite/energy_db.sqlite")

# url = config.url
# engine = sqlalchemy.create_engine(url)


total_consumption_df = pd.read_sql("SELECT * FROM total_consumption", engine)
emissions_df = pd.read_sql("SELECT * FROM emissions", engine)
coal_consumption_df = pd.read_sql("SELECT * FROM coal_consumption", engine)
electricity_consumption_df = pd.read_sql("SELECT * FROM electricity_consumption", engine)
ng_consumption_df = pd.read_sql("SELECT * FROM ng_consumption", engine)
oil_consumption_df = pd.read_sql("SELECT * FROM oil_consumption", engine)
electricity_renewables_df = pd.read_sql("SELECT * FROM electricity_renewables_share", engine)
gdp_df = pd.read_sql("SELECT * FROM gdp_table", engine)

# Function that ranks a country for a specific topic
def funRankCountry(df_data,enertype,list_Col_NOT,country):
    df = df_data.copy()
    df = df.loc[df["Year"]==max(df["Year"])]
    list_Col_2Ext = [x for x in df.columns if x not in list_Col_NOT]
    
    list_dict = []
    for x in list_Col_2Ext:
        dict_x = {'Country': x, 'Type' : enertype,'Value': df[x].values[0]}
        list_dict.append(dict_x)
        
    list_dict_sorted = sorted(list_dict, key=lambda k: k['Value'], reverse=True)
    for i in range(len(list_dict_sorted)):
        i += 1
        list_dict_sorted[i-1]['Rank'] = i
        
    list_dict_x = [dict_x for dict_x in list_dict_sorted if dict_x['Country'] == country]
        
    return list_dict_x[0]

# Function that adapts the df_GDP to a structure to be used in "funRankCountry"

# def funPreprocGDP(df_GDP,df_Name,list_Col_NOT):
    # list_countries = list(df_GDP["Country"].unique())
    # count = 0
    # for country in list_countries:
    #     df_country = df_GDP.loc[df_GDP["Country"]==country][["Year","Total"]]
    #     df_country.rename(columns={'Total': country}, inplace=True)
    #     if count == 0:
    #         df_final = df_country
    #         count += 1
    #     else:
    #         df_final = pd.merge(df_final, df_country, on='Year', how='inner')
            
    # df = df_Name.copy()    
    # list_Col_2Ext = [x for x in df.columns if x not in list_Col_NOT]    
    # list_Col_GDP = list(df_final.columns)
    
    # new_list_GDP = []
    # old_list_GDP = []
    # for x in list_Col_2Ext:
    #     for y in list_Col_GDP:
    #         if (x in y) & (len(y)>len(x)):
    #             new_list_GDP.append(x)
    #             old_list_GDP.append(y)

    # for i in range(len(new_list_GDP)):
    #     df_final = df_final.rename(columns={old_list_GDP[i]: new_list_GDP[i]})
    
    # return df_final
def funPreprocGDP(df_GDP):
    list_countries = list(df_GDP["Country"].unique())
    count = 0
    for country in list_countries:
        df_country = df_GDP.loc[df_GDP["Country"]==country][["Year","Total"]]
        df_country.rename(columns={'Total': country}, inplace=True)
        if count == 0:
            df_final = df_country
            count += 1
        else:
            df_final = pd.merge(df_final, df_country, on='Year', how='inner')
            

    
    return df_final


app = Flask(__name__)

@app.route("/")
def home():
    # return render_template("index1.html")
    return render_template("Dashboard.html")

@app.route("/Map")
def Map():

    return render_template("Map.html")
 

@app.route("/countries")
def countries():
    column_names = total_consumption_df.columns[1:] # Grab grab all the country names (skip column one, Year)
    return jsonify(sorted(column_names))            # Sort country names and the retunr them
    # return jsonify(list(total_consumption_df.columns)[1:])


@app.route("/rank/<country>")
def rank(country):    
    list_Col_NOT = ["Year","World","OECD","G7","BRICS","Europe","European Union","Africa","Middle-East","CIS", \
                    "Latin America","America","North America","Asia","Pacific"]
    # df_GDP = funPreprocGDP(gdp_df,total_consumption_df,list_Col_NOT)
    df_GDP = funPreprocGDP(gdp_df)
    dict_final ={
        "Total" : funRankCountry(total_consumption_df,"Total",list_Col_NOT,country)["Rank"],
        "Coal" : funRankCountry(coal_consumption_df,"Coal",list_Col_NOT,country)["Rank"],
        "Electricity" : funRankCountry(electricity_consumption_df,"Electricity",list_Col_NOT,country)["Rank"],
        "Natural Gas" : funRankCountry(ng_consumption_df,"Natural Gas",list_Col_NOT,country)["Rank"],
        "Oil" : funRankCountry(oil_consumption_df,"Oil",list_Col_NOT,country)["Rank"],
        "Electr Renew": funRankCountry(electricity_renewables_df,"Electr Renew",list_Col_NOT,country)["Rank"],
        "GDP" : funRankCountry(df_GDP,"GDP",list_Col_NOT,country)["Rank"],
        "CO2_emissions":funRankCountry(emissions_df,"CO2 Em",list_Col_NOT,country)["Rank"]
    }
    return jsonify(dict_final)


@app.route("/consumption/<country>")
def consumption(country):
    data = {
        "year": total_consumption_df.Year.values.tolist(),
        "total_consumption": total_consumption_df[country].values.tolist(),
        "oil_consumption": oil_consumption_df[country].values.tolist(),
        "ng_consumption": ng_consumption_df[country].values.tolist(),
        "electricity_consumption": electricity_consumption_df[country].values.tolist(),
        "coal_consumption": coal_consumption_df[country].values.tolist(),
        "electricity_renewables": electricity_renewables_df[country].values.tolist(),
       
    }
    return jsonify(data)

# Prob need to improve the route so it it returns data for a given country or a given year
# @app.route("/gdp")
# def gdp():    
#     data = {
#         "country": gdp_df.Country.values.tolist(),
#         "year": gdp_df.Year.values.tolist(),
#         "agriculture": gdp_df.Agriculture.values.tolist(),
#         "mining": gdp_df.Mining.values.tolist(),
#         "manufacturing": gdp_df.Manufacturing.values.tolist(),
#         "construction": gdp_df.Construction.values.tolist(),
#         "wholesale": gdp_df.Wholesale.values.tolist(),
#         "transport": gdp_df.Transport.values.tolist(),
#         "other": gdp_df.Other.values.tolist(),
#     }
#     return jsonify(data)

@app.route("/gdp/<country>")
def gdp(country):
    list_Col_NOT = ["Year","World","OECD","G7","BRICS","Europe","European Union","Africa","Middle-East","CIS", \
                    "Latin America","America","North America","Asia","Pacific"]
    # df_GDP = funPreprocGDP(gdp_df,total_consumption_df,list_Col_NOT)
    df_GDP = funPreprocGDP(gdp_df)

    data = {
        "year": df_GDP.Year.values.tolist(),
        "GDP": df_GDP[country].values.tolist()
    }
    return jsonify(data)


# @app.route("/population/<country>")
# def population(country):

#     data = {
#         "year": population_df.year.values.tolist(),
#         "population": population_df[country].values.tolist(),
#     }
#     return jsonify(data)


# @app.route("/winemag")
# def winemag():

#     data = {
#         "country": winemag_df.country.tolist(),
#         "points": winemag_df.points.values.tolist(),
#         "price": winemag_df.price.values.tolist(),
#         "variety": winemag_df.variety.tolist(),
#     }
#     return jsonify(data)

# Route for bubble chart
# @app.route("/bubble")
# def bubble():  
#   return bubble_df.to_json(orient = "records")

if __name__ == "__main__":
    app.run()