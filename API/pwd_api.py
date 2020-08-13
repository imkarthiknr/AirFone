from flask import Flask, request, jsonify,redirect
from flask_restful import Resource, Api
from flaskext.mysql import MySQL
from flask_cors import CORS
from random import randint
import sys

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
app.config['MYSQL_DATABASE_PASSWORD'] = 'root'
app.config['MYSQL_DATABASE_DB'] = env
app.config['MYSQL_DATABASE_HOST'] = 'localhost'

mysql.init_app(app)

api = Api(app)
class Update(Resource):
	def put(self,MobileNo,Pwd):
		data = request.get_json()
		conn = mysql.connect()
		cursor = conn.cursor()
		select_query ="update customer set Pwd='"+Pwd+"' where MobileNo='"+MobileNo+"'"
		cursor.execute(select_query)
		conn.commit()
		conn.close()
		rows = cursor.fetchall()
		if len(rows) > 0:
			resp = jsonify(rows)
		return {'Update' : 'Success'}


api.add_resource(Update,'/updates/<string:MobileNo>/<string:Pwd>')
app.run(port=port, debug=True)