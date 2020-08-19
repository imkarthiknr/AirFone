#import statements
from flask import Flask, request, jsonify, redirect
from flask_restful import Resource, Api
from flaskext.mysql import MySQL
from flask_cors import CORS
from random import randint
import random
import sys
import datetime
import smtplib
import requests
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import timedelta
mysql = MySQL()
app = Flask(_name_)
CORS(app)

#port number and d
port = 4003
env = "airfone"
if _name_ == "_main_":
    if len(sys.argv) > 1:
        env = sys.argv[1]
        print("env=" + env)
    if len(sys.argv) > 2:
        port = sys.argv[2]
        print("port=" + port)

# MySQL configurations
app.config['MYSQL_DATABASE_USER'] = 'root'
app.config['MYSQL_DATABASE_PASSWORD'] = 'root'
app.config['MYSQL_DATABASE_DB'] = env
app.config['MYSQL_DATABASE_HOST'] = 'localhost'

mysql.init_app(app)

api = Api(app)
user_time = str(datetime.datetime.now()) #today date and time

# class for register new connection
class Register(Resource):
    def post(self):
        data = request.get_json()
        conn = mysql.connect()
        cursor = conn.cursor()
        range_start = 10 ** (10 - 2)
        range_end = (10 ** 10) - 1
        start = randint(6, 9)
        MobileNo = str(start) + str(randint(range_start, range_end))  # Mobile number is generating randomly
        if len(MobileNo) > 10:
            MobileNo = MobileNo[:10]
        check_query = 'select MobileNo from customer'
        cursor.execute(check_query)
        rows_phno = cursor.fetchall()
        if len(rows_phno) > 0:
            for i in rows_phno:
                if i == MobileNo:
                    range_start = 10 ** (10 - 2)
                    range_end = (10 ** 10) - 1
                    start = randint(6, 9)
                    MobileNo = str(start) + str(randint(range_start,
                                                        range_end))  # checking in the database if the mobile number exists then call a new random value.
                else:
                    continue
        if len(MobileNo) > 10:
            MobileNo = MobileNo[:10]
        insert_query = "insert into customer values ('" + data['CName'] + "', '" + data['DOB'] + "', '" + data[
            'Email'] + "', '" + MobileNo + "', '" + data['Pwd'] + "', '" + data['Occupation'] + "', '" + data[
                           'AadharNumber'] + "', '" + data['HouseNo'] + "', '" + data['Street'] + "', '" + data[
                           'City'] + "', '" + data['State'] + "', '" + data['pincode'] + "', '" + data[
                           'Type_Cust'] + "')"
        row_count = cursor.execute(insert_query)
        conn.commit()
        conn.close()
        # department = {'dept_id': dept_id, 'dept_name': data['dept_name']}
        if row_count == 1:
            mgs = "Hi " + data['CName'] + ", \
    			\
    			\
    			Your mobile number is " + str(MobileNo) + " please login and recharge thank you."
            subject = "Mobile number generated, Airfone"
            m = MIMEMultipart()
            m['Subject'] = subject
            m.attach(MIMEText(mgs, 'plain'))
            text = m.as_string()
            server_ssl = smtplib.SMTP_SSL("smtp.gmail.com", 465)
            server_ssl.ehlo()  # optional, called by login()
            server_ssl.login("karthik.elearning@gmail.com", "KarthI@1804")
            # ssl server doesn't support or need tls, so don't call server_ssl.starttls()
            server_ssl.sendmail("karthik.elearning@gmail.com", str(data['Email']),
                                text)  # sending email to the customer with ticket and client assign
            # server_ssl.quit()
            server_ssl.close()
            return "success"
        else:
            return "not found"


# class to get the data from the database for login by checking phone number and password in database
class Login(Resource):
    def post(self): #parameter passed phone number and password
        data = request.get_json()
        conn = mysql.connect()
        cursor = conn.cursor()
        select_query = "select MobileNo,Pwd from customer where  MobileNo = '"+data["mobileno"]+"' and Pwd = '"+data["Pwd"]+"'"
        cursor.execute(select_query)
        rows = cursor.fetchall()
        mydict={}
        for row in rows:
            mydict["mobilenumber"]=row[0]
            mydict["password"]=row[1]
        if len(rows) > 0:
             return mydict
        else:
            invalid={'not-found':'invalid'}
            return invalid
        return {'department': None}, 404

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
                        server_ssl.login("karthik.elearning@gmail.com", "KarthI@1804")
                        # ssl server doesn't support or need tls, so don't call server_ssl.starttls()
                        server_ssl.sendmail("sender_email",str(Email), text) #sending email to the customer with recharge details
                        #server_ssl.quit()
                        server_ssl.close()
                        url = "https://www.fast2sms.com/dev/bulk"
                        querystring = {
                            "authorization": "eX9icbPK83NpojTLtrS0QlxdUwvWEHCYM2y4mnAJfhg5VDR7IBbisqxnGEZYLB80TptVcWDueP53FNKI",
                            "sender_id": "FSTSMS",
                            "message": mgs, "language": "english", "route": "p",
                            "numbers": str(phno)
                        }
                        headers = {'cache-control': "no-cache"}
                        response = requests.request("GET", url, headers=headers, params=querystring)
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
                        server_ssl.login("karthik.elearning@gmail", "KarthI@1804")
                        # ssl server doesn't support or need tls, so don't call server_ssl.starttls()
                        server_ssl.sendmail("sender_email",str(Email), text) #sending email to the customer with recharge details
                        #server_ssl.quit()
                        server_ssl.close()
                        url = "https://www.fast2sms.com/dev/bulk"
                        querystring = {
                            "authorization": "eX9icbPK83NpojTLtrS0QlxdUwvWEHCYM2y4mnAJfhg5VDR7IBbisqxnGEZYLB80TptVcWDueP53FNKI",
                            "sender_id": "FSTSMS",
                            "message": mgs, "language": "english", "route": "p",
                            "numbers": str(phno)
                        }
                        headers = {'cache-control': "no-cache"}
                        response = requests.request("GET", url, headers=headers, params=querystring)
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
                    end=datetime.datetime.now() + timedelta(days=30)
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
                        server_ssl.login("karthik.elearning@gmail.com", "KarthI@1804")
                        # ssl server doesn't support or need tls, so don't call server_ssl.starttls()
                        server_ssl.sendmail("sender_email",str(Email), text)   #sending email to the customer with ticket and client assign
                        #server_ssl.quit()
                        server_ssl.close()
                        url = "https://www.fast2sms.com/dev/bulk"
                        querystring = {
                            "authorization": "eX9icbPK83NpojTLtrS0QlxdUwvWEHCYM2y4mnAJfhg5VDR7IBbisqxnGEZYLB80TptVcWDueP53FNKI",
                            "sender_id": "FSTSMS",
                            "message": mgs, "language": "english", "route": "p",
                            "numbers": str(phno)
                        }
                        headers = {'cache-control': "no-cache"}
                        response = requests.request("GET", url, headers=headers, params=querystring)
                    department = {'Mobile No': phno, 'Price': plan}
                    return department, 201
                else:
                    return {"invalid price":plan}
            else:
                return {"phone number not registered":phno}
        else:
            return {"not a broadband customer":phno}
#class for help
class Help(Resource):
    def post(self,Email):
        conn = mysql.connect()
        cursor = conn.cursor()
        data = request.get_json()
        #selecting client randomly
        list_person=['Ram','Sita','Karthik','Hayath','Jeethander','abc','Rupika','Rahim','John']
        person= random.choice(list_person)
        #selecting number randomly
        list_no=['9999999999','9877898899','9898887899','9798789879']
        n= random.choice(list_no)
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
                Sorry for inconvenience your complaint from mobile number "+str(pn)+" has been registered with ticket- "+str(ticket)+" you can contact our client "+str(person)+" contact details "+str(n)+" airfone@air.com"
                subject="Hi "+data['name']+", your issues ticket "+str(ticket)
                m=MIMEMultipart()
                m['Subject']=subject
                m.attach(MIMEText(mgs,'plain'))
                text=m.as_string()
                server_ssl = smtplib.SMTP_SSL("smtp.gmail.com", 465)
                server_ssl.ehlo() # optional, called by login()
                server_ssl.login("hayath.py0@gmail.com", "HayathT#00")
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
#class for payment history
class PaymentHistory(Resource):
    def post(self):
        data = request.get_json()
        conn = mysql.connect()
        cursor = conn.cursor()
        insert_query = "insert into paymenthistory (name,email,mobile,cname,cnum,expmonth,expyear,cvv) values (%s,%s,%s,%s,%s,%s,%s,%s)"
        query = (data['name'],data['email'],data['mobile'],data['cname'],data['cnum'],data['expmonth'],data['expyear'],data['cvv'],)
        cursor.execute(insert_query,query)
        affected_row_count = cursor.rowcount
        conn.commit()
        conn.close()
        response = {'Card': 'accepted'}
        if affected_row_count > 0:
            return response, 203
        return 404

#class for Bill history
class History(Resource):
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

#class for forget password
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
        from_email = "hayath.py0@gmail.com"
        from_password = "HayathT#00"
        to_email = email

        subject = "Forgot Password"
        message = "Hey Whatsapp, as per your request from this mail id<strong>%s</strong> Your Password is <strong>%s</strong> Thanks to Use our service." % (
        email_id, password)

        msg = MIMEText(message, 'html')
        msg["Subject"] = subject
        msg["To"] = to_email
        msg["From"] = from_email

        gmail = smtplib.SMTP('smtp.gmail.com', 587)
        gmail.ehlo()
        gmail.starttls()
        gmail.login(from_email, from_password)
        gmail.send_message(msg)
        if len(rows)>0:
            return {"result":"success"}
        else:
            invalid={'not-found':'invalid'}
            return invalid


#api connection
api.add_resource(ForgetPassword,'/email/<string:email>')
api.add_resource(History,'/historys/<string:phno>')
api.add_resource(Login, '/login')
api.add_resource(Register, '/register')
api.add_resource(BillingPrepaid,'/billings/<string:phno>/<string:plan>')
api.add_resource(BillingPostpaid,'/billingspostpaids/<string:phno>/<string:plan>')
api.add_resource(BillingBroadband,'/billingsbroadbands/<string:phno>/<string:plan>')
api.add_resource(PaymentHistory, '/payment')
api.add_resource(Help,'/helps/<string:Email>')

#api port connection
app.run(port=port, debug=True)
