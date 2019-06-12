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


# inspector = inspect(engine)
# for table_name in inspector.get_table_names():
#    print(table_name)
#    for column in inspector.get_columns(table_name):
#        print("Column: %s" % column['name'])


production_df = pd.read_sql("SELECT * FROM production_db", engine)
consumption_df = pd.read_sql("SELECT * FROM consumption_db", engine)
population_df = pd.read_sql("SELECT * FROM population_db", engine)

winemag_df = pd.read_sql("SELECT * FROM winemag_db", engine)



app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/production/<country>")
def production(country):

    data = {
        "year": population_df.year.values.tolist(),
        "production": production_df[country].values.tolist(),
    }
    return jsonify(data)

@app.route("/consumption/<country>")
def consumption(country):

    data = {
        "year": population_df.year.values.tolist(),
        "consumption": consumption_df[country].values.tolist(),
    }
    return jsonify(data)


@app.route("/population/<country>")
def population(country):

    data = {
        "year": population_df.year.values.tolist(),
        "population": population_df[country].values.tolist(),
    }
    return jsonify(data)


@app.route("/winemag")
def winemag():

    data = {
        "country": winemag_df.country.tolist(),
        "points": winemag_df.points.values.tolist(),
        "price": winemag_df.price.values.tolist(),
        "variety": winemag_df.variety.tolist(),
    }
    return jsonify(data)

if __name__ == "__main__":
    app.run()