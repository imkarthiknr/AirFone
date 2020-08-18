from flask import Flask, request, jsonify,redirect
from flask_restful import Resource, Api
from flaskext.mysql import MySQL
from flask_cors import CORS
from random import randint
import sys
import datetime
import pandas as pd
import time

mysql = MySQL()
app = Flask(__name__)
CORS(app)

port = 4004
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

class UserDetails(Resource):
	def get(self):
		data = request.get_json()
		conn = mysql.connect()
		cursor = conn.cursor()
		select_query = "select * from customer"
		cursor.execute(select_query)
		rows = cursor.fetchall()
		mydict={}
		arr=[]
		for row in rows:
			arr.append({"uname":row[0],"mobileno":row[3],"upassword":row[4],"typecust":row[12]})
			mydict["user"]=arr
			#mydict["uname"]=row[0]
			#mydict["upassword"]=row[4]
		if len(rows) > 0:
		    return mydict
		else:
			invalid={'not-found':'invalid'}
			return invalid

		return {'User': None}, 404

class CustomerDelete(Resource):
    def delete(self,cust_id):
        conn = mysql.connect()
        cursor = conn.cursor()
        delete_query =" delete from customer where MobileNo= " +str(cust_id)
        cursor.execute(delete_query)
        conn.commit()
        conn.close()
        return {'deleted': 'Success'}, 201
class Singleuser(Resource):
	def get(self,mobileno):
		data = request.get_json()
		conn = mysql.connect()
		cursor = conn.cursor()
		select_query = "select * from customer where MobileNo="+str(mobileno)
		cursor.execute(select_query)
		rows = cursor.fetchall()
		mydict={}
		arr=[]
		for row in rows:
			arr.append({"uname":row[0],"mobileno":row[3],"upassword":row[4],"typecust":row[12]})
			mydict["user"]=arr
			#mydict["uname"]=row[0]
			#mydict["upassword"]=row[4]
		if len(rows) > 0:
		    return mydict
		else:
			invalid={'not-found':'invalid'}
			return invalid

		return {'User': None}, 404

class UserUpdate(Resource):
    def put(self, mobileno):
        data = request.get_json()
        conn = mysql.connect()
        cursor = conn.cursor()
        update_query = "update customer set CName = '" + data['CName'] + "',Pwd ='" + data['Pwd'] + "' , Type_cust ='" + data['Type_cust'] + "' where MobileNo= " + str(mobileno)
        cursor.execute(update_query)
        conn.commit()
        conn.close()
        customer = {'updated':'success'}
        return customer, 201

class Billgenerate(Resource):
	def get(self,start,end,cust_type):
		data = request.get_json()
		conn = mysql.connect()
		cursor = conn.cursor()
		select_query = "select * from billing_customer where start>= '"+str(start)+"' and start<='"+str(end)+"'and cust_type= '"+str(cust_type)+"' "
		cursor.execute(select_query)
		rows = cursor.fetchall()
		mydict={}
		arr=[]
		for row in rows:
			#startdate=time.mktime(time.strptime(row[6], '%Y-%m-%d %H:%M:'))
			#print(start)
			#enddate = time.mktime(time.strptime(row[7], '%Y-%m-%d %H:%M:%S'))
			arr.append({"bill_id":row[0],"mobileno":row[1],"uname":row[2],"email":row[3],"price":row[5]})
			#sprint(datetime.date(row[6]))
			mydict["Bill"]=arr
		if len(rows) > 0:
		    return mydict
		else:
			invalid={'not-found':'invalid'}
			return invalid


class Adminlogin(Resource):
	def get(self):
		data = request.get_json()
		conn = mysql.connect()
		cursor = conn.cursor()
		select_query = "select * from adminprofile"
		cursor.execute(select_query)
		rows = cursor.fetchall()
		mydict={}
		arr=[]
		for row in rows:
			arr.append({"adminid":row[0],"auname":row[1],"apassword":row[2]})
			mydict["admin"]=arr
		if len(rows) > 0:
		    return mydict
		else:
			invalid={'not-found':'invalid'}
			return invalid

		return {'User': None}, 404

class AdminUpdate(Resource):
    def put(self,adminid):
        data = request.get_json()
        conn = mysql.connect()
        cursor = conn.cursor()
        update_query = "update adminprofile set uname = '" + data['adminname'] + "',pass='" + data['adminpassword'] + "' where admin_id= " + str(adminid)
        cursor.execute(update_query)
        conn.commit()
        conn.close()
        customer = {'updated':'success'}
        return customer, 201

class ComplaintDetails(Resource):
	def get(self):
		data = request.get_json()
		conn = mysql.connect()
		cursor = conn.cursor()
		select_query = "select * from help"
		cursor.execute(select_query)
		rows = cursor.fetchall()
		mydict={}
		arr=[]
		for row in rows:
			arr.append({"ticket_id":row[0],"name":row[1],"email":row[2],"description":row[3],"assignedperson":row[5],"mobileno":row[6]})
			mydict["complaint"]=arr
			#mydict["uname"]=row[0]
			#mydict["upassword"]=row[4]
		if len(rows) > 0:
		    return mydict
		else:
			invalid={'not-found':'invalid'}
			return invalid

		return {'User': None}, 404

class ComplaintDetail(Resource):
	def get(self,ticketid):
		data = request.get_json()
		conn = mysql.connect()
		cursor = conn.cursor()
		select_query = "select * from help where ticket="+str(ticketid)
		cursor.execute(select_query)
		rows = cursor.fetchall()
		mydict={}
		arr=[]
		for row in rows:
			arr.append({"ticket_id":row[0],"name":row[1],"email":row[2],"description":row[3],"assignedperson":row[5],"mobileno":row[6]})
			mydict["complaint"]=arr
			#mydict["uname"]=row[0]
			#mydict["upassword"]=row[4]
		if len(rows) > 0:
		    return mydict
		else:
			invalid={'not-found':'invalid'}
			return invalid

		return {'User': None}, 404

class LoginToDashboard(Resource):
	def post(self):
		data = request.get_json()
		conn = mysql.connect()
		cursor = conn.cursor()
		select_query = "select * from adminprofile where uname=%s and pass=%s"
		query = (data["uname"],data["pass"],)
		cursor.execute(select_query,query)
		rows = cursor.fetchall()
		mydict={}
		arr=[]
		for row in rows:
			arr.append({"auname":row[1],"apassword":row[2]})
			mydict["admin"]=arr
		if len(rows) > 0:
			response={"adminlogin":"success"}
			return response
		else:
			invalid={'not-found':'invalid'}
			return invalid


class CustomerBillHistory(Resource):
	def get(self,phno):
		conn = mysql.connect()
		cursor = conn.cursor()
		select_query = "select Billing_id,phno,benefits,price,start,end from billing_customer where phno = '"+str(phno)+"'"
		cursor.execute(select_query)
		rows = cursor.fetchall()
		d={}
		a=[]
		for row in rows:
			a.append({"Billing_id":str(row[0]),"MobileNo":row[1],"Benefits":row[2],"price":row[3],"start":str(row[4]),"end":str(row[5])})
			d["billing"]=a
		conn.commit()
		conn.close()
		if(len(rows)>0):
			return d
		return {"billing":"Notfound"}

api.add_resource(UserDetails,'/customerdetails/')
api.add_resource(CustomerDelete,'/customerdelete/<int:cust_id>')
api.add_resource(Singleuser,'/customerdetail/<int:mobileno>')
api.add_resource(UserUpdate,'/customerupdate/<string:mobileno>')
api.add_resource(Billgenerate,'/billgenerate/<string:start>/<string:end>/<string:cust_type>')
api.add_resource(Adminlogin,'/adminprofile/')
api.add_resource(AdminUpdate,'/adminupdate/<int:adminid>')
api.add_resource(ComplaintDetails,'/complaintdetails/')
api.add_resource(ComplaintDetail,'/complaintdetail/<int:ticketid>')
api.add_resource(LoginToDashboard,'/adminlogin/')
api.add_resource(CustomerBillHistory,'/customerbillhistory/<string:phno>')
app.run(port=port)