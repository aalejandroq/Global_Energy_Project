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
bubble_df = pd.read_sql("SELECT * FROM bubble_table", engine)

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

# -----HTML Routes------#

# Dashboard Route

@app.route("/")
def home():
   
    return render_template("Dashboard.html")

# Maps Route
@app.route("/Maps")
def Maps():

    return render_template("Map.html")
 
#Charts Route
@app.route("/Charts")
def Charts():

    return render_template("Charts.html")
 


# ------JSON Routes-------

@app.route("/countries")
def countries():
    column_names = total_consumption_df.columns[1:] # Grab grab all the country names (skip column one, Year)
    return jsonify(sorted(column_names))            # Sort country names and the returns them


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
        # "total_consumption": total_consumption_df[country].values.tolist(),
        "oil_consumption": oil_consumption_df[country].values.tolist(),
        "ng_consumption": ng_consumption_df[country].values.tolist(),
        "coal_consumption": coal_consumption_df[country].values.tolist(),
    }
    return jsonify(data)


@app.route("/electricity/<country>")
def electricity(country):

    renewables = (electricity_renewables_df[country]/100) * electricity_consumption_df[country]
    non_renewables = electricity_consumption_df[country] - renewables

    data = {
        "year": total_consumption_df.Year.values.tolist(),
        "electricity_consumption": non_renewables.values.tolist(),
        "electricity_renewables": renewables.values.tolist(),
    }
    return jsonify(data)


@app.route("/emissions/<country>")
def emissions(country):


    data = {
        "year": total_consumption_df.Year.values.tolist(),
        "emissions": emissions_df[country].values.tolist()
    }
    return jsonify(data)


@app.route("/gdp/<country>")
def gdp(country):

    # Create a temp dataframe with just the for the country passed by the route
    gdp = gdp_df[gdp_df['Country']==country]

    data = {
        "year": gdp.Year.values.tolist(),
        "agriculture": gdp.Agriculture.values.tolist(),
        "mining": gdp.Mining.values.tolist(),
        "manufacturing": gdp.Manufacturing.values.tolist(),
        "construction": gdp.Construction.values.tolist(),
        "wholesale": gdp.Wholesale.values.tolist(),
        "transport": gdp.Transport.values.tolist(),
        "other": gdp.Other.values.tolist() 
    }
    return jsonify(data)


# Route for bubble chart
@app.route("/bubble")
def bubble():  
  return bubble_df.to_json(orient = "records")


if __name__ == "__main__":
    app.run()