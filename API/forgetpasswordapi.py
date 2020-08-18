from flask import Flask, request, jsonify, redirect
from flask_restful import Resource, Api
from flaskext.mysql import MySQL
from flask_cors import CORS
import sys
from email.mime.text import MIMEText
import smtplib
from sendemail2 import *

mysql = MySQL()
app = Flask(__name__)
CORS(app)

port = 4005
env = "airfone"
if __name__ == "__main__":
    if len(sys.argv) > 1:
        env = sys.argv[1]
        print("env=" + env)
    if len(sys.argv) > 2:
        port = sys.argv[2]
        print("port=" + port)

# MySQL configurations
app.config['MYSQL_DATABASE_USER'] = 'root'
app.config['MYSQL_DATABASE_PASSWORD'] = 'Hayath#22'
app.config['MYSQL_DATABASE_DB'] = env
app.config['MYSQL_DATABASE_HOST'] = 'localhost'

mysql.init_app(app)

api = Api(app)

class ForgetPassword(Resource):
    def get(self,email):
        data=request.get_json()
        conn=mysql.connect()
        cursor=conn.cursor()
        select_query="select Email,Pwd from customer where Email=%s"
        query = (email,)
        cursor.execute(select_query,query)
        rows=cursor.fetchall()
        email_id=""
        password=""
        for row in rows:
            email_id=row[0]
            password=row[1]
        send_email(email_id,password)
        if len(rows)>0:
            return "success"
        else:
            invalid={'not-found':'invalid'}
            return invalid

api.add_resource(ForgetPassword,'/email/<string:email>')
app.run(port=port)