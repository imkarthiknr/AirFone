from flask import Flask, request, jsonify,redirect
from flask_restful import Resource, Api
from flaskext.mysql import MySQL
from flask_cors import CORS
import sys
from email.mime.text import MIMEText
import smtplib

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

class SendMail(Resource):
    def post(self,email,name,description,message,attender):
        from_email="hayath.py0@gmail.com"
        from_password="HayathT#00"
        to_email=email


        subject="Complaint Response"
        message="Hey,your height is <strong>%s</strong> and the average of all is <strong>%s</strong> <br>This data collected from this much of <strong>%s</strong> user data <br> Thanks!! <strong>%s</strong>." % (name,description,message,attender)

        msg=MIMEText(message,'html')
        msg["Subject"]=subject
        msg["To"]=to_email
        msg["From"]=from_email


        gmail=smtplib.SMTP('smtp.gmail.com',587)
        gmail.ehlo()
        gmail.starttls()
        gmail.login(from_email,from_password)
        gmail.send_message(msg)
        customer = {'sent': 'success'}
        return customer, 201


api.add_resource(SendMail,'/sendmail/<string:email>/<string:name>/<string:description>/<string:message>/<string:attender>')
app.run(port=port)