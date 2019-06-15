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


app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index1.html")

@app.route("/countries")
def countries():
    return jsonify(list(total_consumption_df.columns)[1:])

@app.route("/total_consumption/<country>")
def totalconsumption(country):
    data = {
        "year": total_consumption_df.Year.values.tolist(),
        "total_consumption": total_consumption_df[country].values.tolist(),
    }
    return jsonify(data)

@app.route("/oil_consumption/<country>")
def oilconsumption(country):
    data = {
        "year": oil_consumption_df.Year.values.tolist(),
        "oil_consumption": oil_consumption_df[country].values.tolist(),
    }
    return jsonify(data)

@app.route("/ng_consumption/<country>")
def ngconsumption(country):
    data = {
        "year": ng_consumption_df.Year.values.tolist(),
        "ng_consumption": ng_consumption_df[country].values.tolist(),
    }
    return jsonify(data)

@app.route("/electricity_consumption/<country>")
def electconsumption(country):
    data = {
        "year": electricity_consumption_df.Year.values.tolist(),
        "electricity_consumption": electricity_consumption_df[country].values.tolist(),
    }
    return jsonify(data)

@app.route("/coal_consumption/<country>")
def coalconsumption(country):
    data = {
        "year": coal_consumption_df.Year.values.tolist(),
        "coal_consumption": coal_consumption_df[country].values.tolist(),
    }
    return jsonify(data)

@app.route("/electricity_renewables/<country>")
def electrenewables(country):
    data = {
        "year": electricity_renewables_df.Year.values.tolist(),
        "electricity_renewables": electricity_renewables_df[country].values.tolist(),
    }
    return jsonify(data)

@app.route("/emissions/<country>")
def emissions(country):
    data = {
        "year": emissions_df.Year.values.tolist(),
        "emissions": emissions_df[country].values.tolist(),
    }
    return jsonify(data)

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

# Prob need to improve the route so it it returns data for a give country or a given year
@app.route("/gdp")
def gdp():
    data = {
        "country": gdp_df.Country.values.tolist(),
        "year": gdp_df.Year.values.tolist(),
        "agriculture": gdp_df.Agriculture.values.tolist(),
        "mining": gdp_df.Mining.values.tolist(),
        "manufacturing": gdp_df.Manufacturing.values.tolist(),
        "construction": gdp_df.Construction.values.tolist(),
        "wholesale": gdp_df.Wholesale.values.tolist(),
        "transport": gdp_df.Transport.values.tolist(),
        "other": gdp_df.Other.values.tolist(),
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

if __name__ == "__main__":
    app.run()