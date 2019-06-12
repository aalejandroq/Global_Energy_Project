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
import config


#engine = sqlalchemy.create_engine("sqlite:///db/winemag_short_db.sqlite")

url = config.url
engine = sqlalchemy.create_engine(url)


total_consumption_df = pd.read_sql("SELECT * FROM total_consumption", engine)
emissions_df = pd.read_sql("SELECT * FROM emissions", engine)
# population_df = pd.read_sql("SELECT * FROM population_db", engine)
# winemag_df = pd.read_sql("SELECT * FROM winemag_db", engine)


app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/countries")
def countries():

    # data = {
    #     "year": total_consumption_df.Year.values.tolist(),
    #     "consumption": total_consumption_df[country].values.tolist(),
    # }
    # return jsonify(data)
    return jsonify(list(total_consumption_df.columns)[1:])

@app.route("/consumption/<country>")
def consumption(country):

    data = {
        "year": total_consumption_df.Year.values.tolist(),
        "consumption": total_consumption_df[country].values.tolist(),
    }
    return jsonify(data)

@app.route("/emissions/<country>")
def emissions(country):

    data = {
        "year": emissions_df.Year.values.tolist(),
        "emissions": emissions_df[country].values.tolist(),
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