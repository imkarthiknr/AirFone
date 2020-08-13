from flask import Flask, request, jsonify, redirect
from flask_restful import Resource, Api
from flaskext.mysql import MySQL
from flask_cors import CORS
from random import randint
import sys

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
app.config['MYSQL_DATABASE_PASSWORD'] = 'root'
app.config['MYSQL_DATABASE_DB'] = env
app.config['MYSQL_DATABASE_HOST'] = 'localhost'

mysql.init_app(app)

api = Api(app)


# class for register new connection
class Register(Resource):
    def post(self):
        data = request.get_json()
        conn = mysql.connect()
        cursor = conn.cursor()
        range_start = 10 ** (10 - 2)
        range_end = (10 ** (10-2))
        start = randint(6, 9)
        MobileNo = str(start) + str(randint(range_start, range_end))  # Mobile number is generating randomly
        check_query = 'select MobileNo from customer'
        cursor.execute(check_query)
        rows_phno = cursor.fetchall()
        if len(rows_phno) > 0:
            for i in rows_phno:
                if i == MobileNo:
                    range_start = 10 ** (10 - 2)
                    range_end = (10 ** 10) - 2
                    start = randint(6, 9)
                    MobileNo = str(start) + str(randint(range_start,
                                                        range_end))  # checking in the database if the mobile number exists then call a new random value.then call a new random value.
                else:
                    continue
        insert_query = "insert into customer values ('" + data['CName'] + "', '" + data['DOB'] + "', '" + data[
            'Email'] + "', '" + MobileNo + "', '" + data['Pwd'] + "', '" + data['Occupation'] + "', '" + data[
                           'AadharNumber'] + "', '" + data['HouseNo'] + "', '" + data['Street'] + "', '" + data[
                           'City'] + "', '" + data['State'] + "', '" + data['pincode'] + "')"
        cursor.execute(insert_query)
        affected_row_count = cursor.rowcount
        conn.commit()
        conn.close()
        response = {'Registration': 'success'}
        if affected_row_count > 0:
            return response
        return 201


# class to get the data from the database for login by checking phone number and password in database
class Login(Resource):
    def get(self, MobileNo, Pwd):  # parameter passed phone number and password
        conn = mysql.connect()
        cursor = conn.cursor()
        select_query = "select * from customer where  MobileNo = '" + MobileNo + "' and Pwd = '" + Pwd + "'"
        cursor.execute(select_query)
        rows = cursor.fetchall()
        if len(rows) > 0:
            resp = jsonify(rows)
            return {'Login': 'Success'}, 203
        return {'Login': 'Failed'}, 404


api.add_resource(Login, '/login/<string:MobileNo>/<string:Pwd>')
api.add_resource(Register, '/register')
app.run(port=port, debug=True)
