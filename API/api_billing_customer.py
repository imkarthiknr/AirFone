from flask import Flask, request, jsonify,redirect
from flask_restful import Resource, Api
from flaskext.mysql import MySQL
from flask_cors import CORS
from random import randint
import sys
import collections
import json
import datetime
import smtplib 
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import timedelta

mysql = MySQL()
app = Flask(__name__)
CORS(app)

port = 4009
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
app.config['MYSQL_DATABASE_PASSWORD'] = ''
app.config['MYSQL_DATABASE_DB'] = env
app.config['MYSQL_DATABASE_HOST'] = 'localhost'

mysql.init_app(app)
user_time = str(datetime.datetime.now()) #today date and time

api = Api(app)
#class for billing for prepaid recharge
class BillingPrepaid(Resource):
	def post(self,phno,plan):
		data = request.get_json()
		conn = mysql.connect()
		cursor = conn.cursor()
		select_query="select CName,Email,Type_Cust from customer where MobileNo = '"+str(phno)+"'" #getting the name email and type of customer
		cursor.execute(select_query)
		rows = cursor.fetchone()
		if rows[2]=="prepaid": #checking the customer type if it is not prepaid account then return not prepaid
			if type(rows)==tuple:
				name=rows[0]
				Email=rows[1]
				cust_type=rows[2]
				select_query1="select * from prepaid where price = '"+str(plan)+"'" #getting the details of the plan with the price since price is unique for all recharge for example Rs. 99 can have one offer.
				cursor.execute(select_query1)
				rows1=cursor.fetchone()
				if type(rows1)==tuple: #checking that the plan have some data in tuple format
					validity=rows1[0]
					end=datetime.datetime.now() + timedelta(days=int(validity)) #adding the validity date to the today date time to get the end date
					benefits=rows1[1]
					call=rows1[2]
					sms=rows1[3]
					ben=str(benefits)+" internet "+str(call)+" calls "+str(sms)+" message"
					insert_query = "insert into billing_customer (phno,name,email,benefits,price,start,end,cust_type) values ('" + str(phno) + "', '" + str(name) + "', '"+str(Email)+"', '"+str(ben)+"', '"+str(plan)+"', '"+user_time+"', '"+str(end)+"', '"+str(cust_type)+"')"
					row_count=cursor.execute(insert_query)
					conn.commit()
					conn.close()
					mgs=''
					if row_count==1:
						mgs="Hi "+str(name)+", \
						\
						\
						Recharge has been made on your mobile number "+str(phno)+" of price "+str(plan)+" benefits "+str(ben)+" thank you."
						subject="Hi "+str(name)+", recharge made on your mobile number "+str(phno)
						m=MIMEMultipart()
						m['Subject']=subject
						m.attach(MIMEText(mgs,'plain'))
						text=m.as_string()
						server_ssl = smtplib.SMTP_SSL("smtp.gmail.com", 465)
						server_ssl.ehlo() # optional, called by login()
						server_ssl.login("sender_email", "password")  
						# ssl server doesn't support or need tls, so don't call server_ssl.starttls() 
						server_ssl.sendmail("sender_email",str(Email), text) #sending email to the customer with recharge details
						#server_ssl.quit()
						server_ssl.close()
					department = {'Mobile No': phno, 'Price': plan}
					return department, 201
				else:
					return {"invalid price":plan}
			else:
				return {"phone number not registered":phno}
		else:
			return {"not a prepaid customer":phno}

#class for billing for postpaid recharge and rest comment are same as above
class BillingPostpaid(Resource):
	def post(self,phno,plan):
		data = request.get_json()
		conn = mysql.connect()
		cursor = conn.cursor()
		select_query="select CName,Email,Type_Cust from customer where MobileNo = '"+str(phno)+"'"
		cursor.execute(select_query)
		rows = cursor.fetchone()
		if rows[2]=="postpaid":
			if type(rows)==tuple:
				name=rows[0]
				Email=rows[1]
				cust_type=rows[2]
				select_query1="select * from postpaid where price = '"+str(plan)+"'"
				cursor.execute(select_query1)
				rows1=cursor.fetchone()
				if type(rows1)==tuple:
					validity=rows1[0]
					end=datetime.datetime.now() + timedelta(days=int(validity))
					benefits=rows1[1]
					call=rows1[2]
					sms=rows1[3]
					ben=str(benefits)+" internet "+str(call)+" calls "+str(sms)+" message"
					insert_query = "insert into billing_customer (phno,name,email,benefits,price,start,end,cust_type) values ('" + str(phno) + "', '" + str(name) + "', '"+str(Email)+"', '"+str(ben)+"', '"+str(plan)+"', '"+user_time+"', '"+str(end)+"', '"+str(cust_type)+"')"
					row_count=cursor.execute(insert_query)
					conn.commit()
					conn.close()
					mgs=''
					if row_count==1:
						mgs="Hi "+str(name)+", \
						\
						\
						Recharge has been made on your mobile number "+str(phno)+" of price "+str(plan)+" benefits "+str(ben)+" thank you."
						subject="Hi "+str(name)+", recharge made on your mobile number "+str(phno)
						m=MIMEMultipart()
						m['Subject']=subject
						m.attach(MIMEText(mgs,'plain'))
						text=m.as_string()
						server_ssl = smtplib.SMTP_SSL("smtp.gmail.com", 465)
						server_ssl.ehlo() # optional, called by login()
						server_ssl.login("sender_email", "password")  
						# ssl server doesn't support or need tls, so don't call server_ssl.starttls() 
						server_ssl.sendmail("sender_email",str(Email), text) #sending email to the customer with recharge details
						#server_ssl.quit()
						server_ssl.close()
					department = {'Mobile No': phno, 'Price': plan}
					return department, 201
				else:
					return {"invalid price":plan}
			else:
				return {"phone number not registered":phno}
		else:
			return {"not a postpaid customer":phno}



#class for billing for broadband recharge and rest comment is same
class BillingBroadband(Resource):
	def post(self,phno,plan):
		data = request.get_json()
		conn = mysql.connect()
		cursor = conn.cursor()
		select_query="select CName,Email,Type_Cust from customer where MobileNo = '"+str(phno)+"'"
		cursor.execute(select_query)
		rows = cursor.fetchone()
		if rows[2]=="broadband":
			if type(rows)==tuple:
				name=rows[0]
				Email=rows[1]
				cust_type=rows[2]
				select_query1="select * from broadband where price = '"+str(plan)+"'"
				cursor.execute(select_query1)
				rows1=cursor.fetchone()
				if type(rows1)==tuple:
					validity=rows1[0]
					end=datetime.datetime.now() + timedelta(days=int(validity))
					benefits=rows1[1]
					call=rows1[2]
					sms=rows1[3]
					ben=str(benefits)+" internet speed "+str(call)+" limit "+str(sms)+" internet speed in mobile"
					insert_query = "insert into billing_customer (phno,name,email,benefits,price,start,end,cust_type) values ('" + str(phno) + "', '" + str(name) + "', '"+str(Email)+"', '"+str(ben)+"', '"+str(plan)+"', '"+user_time+"', '"+str(end)+"', '"+str(cust_type)+"')"
					row_count=cursor.execute(insert_query)
					conn.commit()
					conn.close()
					mgs=''
					if row_count==1:
						mgs="Hi "+str(name)+", \
						\
						\
						Recharge has been made on your mobile number "+str(phno)+" of price "+str(plan)+" benefits "+str(ben)+" thank you."
						subject="Hi "+str(name)+", recharge made on your mobile number "+str(phno)
						m=MIMEMultipart()
						m['Subject']=subject
						m.attach(MIMEText(mgs,'plain'))
						text=m.as_string()
						server_ssl = smtplib.SMTP_SSL("smtp.gmail.com", 465)
						server_ssl.ehlo() # optional, called by login()
						server_ssl.login("sender_email", "password")  
						# ssl server doesn't support or need tls, so don't call server_ssl.starttls() 
						server_ssl.sendmail("sender_email",str(Email), text) #sending email to the customer with ticket and client assign
						#server_ssl.quit()
						server_ssl.close()
					department = {'Mobile No': phno, 'Price': plan}
					return department, 201
				else:
					return {"invalid price":plan}
			else:
				return {"phone number not registered":phno}
		else:
			return {"not a broadband customer":phno}




api.add_resource(BillingPrepaid,'/billings/<string:phno>/<string:plan>')
api.add_resource(BillingPostpaid,'/billingspostpaids/<string:phno>/<string:plan>')
api.add_resource(BillingBroadband,'/billingsbroadbands/<string:phno>/<string:plan>')
app.run(port=port)