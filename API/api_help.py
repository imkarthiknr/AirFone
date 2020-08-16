from flask import Flask, request, jsonify,redirect
from flask_restful import Resource, Api
from flaskext.mysql import MySQL
import smtplib 
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask_cors import CORS
import sys
import datetime
import random
from random import randint
mysql = MySQL()
app = Flask(__name__)
CORS(app)

port = 4003
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
user_time = str(datetime.datetime.now())
mysql.init_app(app)

api = Api(app)
row_count=0
class Help(Resource):
	def post(self,Email):
		conn = mysql.connect()
		cursor = conn.cursor()
		data = request.get_json()
		#selecting client randomly
		list_person=['Ram','Sita','Karthik','Hayath','Jeethander','abc','Rupika','Rahim','John']
		person=random.choice(list_person)
		#selecting number randomly
		list_no=['9999999999','9877898899','9898887899','9798789879']
		n=random.choice(list_no)
		#generating ticket randomly
		range_start = 5**(5-1)
		range_end = (5**5)-1
		ticket=str(randint(range_start, range_end)) #ticket is generating randomly
		check_query='select ticket from help' #checking if the ticket is present or not
		cursor.execute(check_query)
		rows_ticket = cursor.fetchall()
		if len(rows_ticket) > 0:
		    for i in rows_ticket:
		    	if i==ticket:
		    		range_start = 5**(5-1)
		    		range_end = (5**5)-1
		    		ticket=str(randint(range_start, range_end)) #checking in the database if the mobile number exists then call a new random value.
		    	else:
		    		continue
		select_query="select MobileNo from customer where Email = '"+str(Email)+"'"
		cursor.execute(select_query)
		phno=cursor.fetchone()
		if type(phno)==tuple:
			pn=phno[0]
			#inserting for admin
			insert_query = "insert into help values ('" +ticket+ "', '" + data['name'] + "','"+str(Email)+"','"+data['description']+"','"+user_time+"', '"+person+"', '"+str(pn)+"')"
			row_count=cursor.execute(insert_query)
			conn.commit()
			conn.close()
			mgs=''
			if row_count==1:
				mgs="Hi "+data['name']+", \
				\
				\
				Sorry for inconvenience your complain from mobile number "+str(pn)+" has been registered with ticket- "+str(ticket)+" you can contact our client "+str(person)+" contact details "+str(n)+" airfone@air.com"
				subject="Hi "+data['name']+", your issues ticket "+str(ticket)
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
				return 'success'
			else:
				return 'not found'
		else:
			return "email is not registered"

		return {'department': None}, 404


api.add_resource(Help,'/helps/<string:Email>')
app.run(port=port)