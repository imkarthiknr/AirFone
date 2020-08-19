create database airfone;
use airfone;

create table customer (CName varchar(20),DOB varchar(10),Email varchar(30),MobileNo varchar(10), Pwd varchar(20), Occupation varchar(20), AadharNumber varchar(12), HouseNo varchar(10), Street varchar(20), City varchar(20), State varchar(20), pincode varchar(6),Type_Cust varchar(10),primary key(MobileNo));
desc customer;
drop table customer;
insert into customer values("karthik","1999-04-18","karthik180499@gmail.com","9344219186","karthik@99","Software Engineer","456712389012","No-12","Gandhi street","Chennai","TN","630302","prepaid");
insert into customer values("Jithu","1999-04-09","jeethendrakumar1999@gmail.com","7358592345","jithu@99","Software Engineer","412416205029","No-1/501","Natco Colony","Chennai","TN","600041","Prepaid");
insert into customer values("Hayath","1998-12-22","hayathmasthan1998@gmail.com","8056827615","hayath@99","Chemical engineer","412416205028","No-97","Anna Street","Coimbatore","TN","690081","Postpaid");
insert into customer values("karthik","1999-04-18","karthik180499@gmail.com","7397265570","karthik@99","Accounts Manager","456712389012","No-12","Gandhi street","Chennai","TN","630302","broadband");
insert into customer values("Rupika","1998-11-27","rupanithya@gmail.com","7985346570","rupika@98","General manager","456734589037","No-67","Thiru Vee Kaa nagar","Chennai","TN","600082","Prepaid");
insert into customer values("Akash","2000-08-04","akashkumar2000@gmail.com","9865764872","akash@22","Network Admin","456712389012","No-12","Gandhi street","Chennai","TN","630302","Prepaid");
insert into customer values("Vignesh","2001-12-25","vicky1001@gmail.com","7829827652","vicky@001","Marketing analyst","180094638562","No-82","Vallalar street","Madurai","TN","606551","broadband");
insert into customer values("Pooja","2003-03-04","poojaboobalan@gmail.com","9003260106","pooja@003","Fashion designer","987634256743","No-77","AGS colony","Thiruchirapalli","TN","670032","Postpaid");
insert into customer values("Harini","2001-09-13","harinichandrasegaran@gmail.com","9043618662","harini@013","Medical surgen","892090872345","No-9/20","NSN Street","Thiruvannamalai","TN","600431","postpaid");
insert into customer values("Ashwin","1998-08-14","ashwinsylesh@yahoo.com","9787525867","ashwin@998","Accountant","134526783450","No-63","Nehru Street","Thanjavur","TN","689090","Prepaid");
insert into customer values("Surya","1997-11-11","suryasathish@gmail.com","9870654326","surya@0031","Professor","764523495678","No-93","Indhra nagar","Chennai","TN","600143","Broadband");
select * from customer;

create table prepaid(validity varchar(20),benefits varchar(20),calling varchar(20),sms varchar(20),price int primary key);
insert into prepaid values('2','200MB','UNLIMITED','NIL',19);
insert into prepaid values('18','1GB','UNLIMITED','100',99);
insert into prepaid values('24','1GB','UNLIMITED','300',129);
insert into prepaid values('28','2GB','UNLIMITED','300',149);
insert into prepaid values('28','2.5GB','UNLIMITED','500',169);
insert into prepaid values('24','1GB','UNLIMITED','100',199);
insert into prepaid values('28','1GB','UNLIMITED','100',219);
insert into prepaid values('28','1GB','UNLIMITED','100',249);
insert into prepaid values('28','1.5GB','UNLIMITED','100',279);
insert into prepaid values('28','2GB','UNLIMITED','100',298);
insert into prepaid values('28','2GB','UNLIMITED','100',349);
insert into prepaid values('84','6GB','UNLIMITED','900',379);
insert into prepaid values('28','3GB','UNLIMITED','100',398);
insert into prepaid values('56','1.5GB','UNLIMITED','100',399);
insert into prepaid values('56','2GB','UNLIMITED','100',449);
insert into prepaid values('56','3GB','UNLIMITED','100',558);
select * from prepaid;

create table postpaid(data varchar(20),validity varchar(20),calling varchar(20),sms varchar(20),price int primary key);
insert into postpaid values('125GB','365','UNLIMITED','UNLIMITED',749);
insert into postpaid values('150GB','365','UNLIMITED','UNLIMITED',999);
insert into postpaid values('200GB','365','UNLIMITED','UNLIMITED',1099);
insert into postpaid values('50GB','30','100Minutes','UNLIMITED',210);
insert into postpaid values('75GB','30','100Minutes','UNLIMITED',300);
insert into postpaid values('120GB','30','1000Minutes','UNLIMITED',400);
select * from postpaid;

create table broadband(id varchar(10) primary key,internet_speed varchar(20),monthly_data varchar(20),post_fpu_speed varchar(10),price int);
insert into broadband values('BB001','150Mbps','1000GB','1Mbps',1075);
insert into broadband values('BB002','350Mbps','2000GB','2Mbps',1999);
insert into broadband values('BB003','1Gbps','3000GB','2Mbps',2999);
insert into broadband values('BB004','150Mbps','500GB','1Mbps',777);
insert into broadband values('BB005','350Mbps','1000GB','2Mbps',1055);
insert into broadband values('BB006','2Gbps','5000GB','2Mbps',3999);

create table help(ticket int  PRIMARY KEY auto_increment,name varchar(20),email varchar(40),description varchar(100),date_of_complain datetime,assign_person varchar(20),phno varchar(20));
insert into help(name,email,description,date_of_complain,assign_person,phno) values ("jag","hayath2212@gmail.com","network issue","2020-8-10","hayath","8056827615");
insert into help (name,email,description,date_of_complain,assign_person,phno) values ("Jithu","jeethendrakuma99@gmail.com","Mobile number has been disabled, cannot make calls","2020-05-16","admin1","7358592345");
insert into help (name,email,description,date_of_complain,assign_person,phno) values ("Hayath","hayathmasthan1998@gmail.com","No calls can be made","2020-04-03","admin2","8056827615");
insert into help (name,email,description,date_of_complain,assign_person,phno) values ("karthik","karthik180499@gmail.com","Network errors occurs often","2020-02-06","admin3","7397264570");
insert into help (name,email,description,date_of_complain,assign_person,phno) values ("Rupika","rupanithya@gmail.com","Unable to recharge my number","2020-05-22","admin4","7985346570");
insert into help (name,email,description,date_of_complain,assign_person,phno) values ("Akash","akashkumar2000@gmail.com","Lots of issues while connecting to a network","2020-05-28","admin5","9865764872");
insert into help (name,email,description,date_of_complain,assign_person,phno) values ("Vignesh","vicky1001@gmail.com","Mobile number has been disabled","2020-10-28","admin6","9829827652");
insert into help (name,email,description,date_of_complain,assign_person,phno) values ("Pooja","poojaboobalan@gmail.com","Sim card has been crashed,Wanted a new sim","2020-06-13","admin7","9003260106");
insert into help (name,email,description,date_of_complain,assign_person,phno) values ("Harini","harinichandrasegaran@gmail.com","Too much of network issues","2020-04-22","admin8","9043618661");
insert into help (name,email,description,date_of_complain,assign_person,phno) values ("Ashwin","ashwinsylesh@yahoo.com","Unable to recharge my number","2020-08-14","admin9","9787525867");
insert into help (name,email,description,date_of_complain,assign_person,phno) values ("Surya","suryasathish@gmail.com","Network errors occurs often","2020-04-01","admin10","9870654326");

create table billing_customer(
Billing_id int PRIMARY KEY auto_increment,
phno varchar(20),
name varchar(20),
email varchar(40),
benefits varchar(500),
price varchar(20),
start date,
end date,
cust_type varchar(20)
);
drop table billing_customer;
insert into billing_customer (phno,name,email,benefits,price,start,end,cust_type) values ("7358592345","Jithu","jeethendrakumar1999@gmail.com","6GB","379","2020-04-01","2020-06-25","Prepaid");
insert into billing_customer (phno,name,email,benefits,price,start,end,cust_type) values ("8056827615","Hayath","hayathmasthan1998@gmail.com","125GB","749","2020-01-01","2020-12-31","Postpaid");
insert into billing_customer (phno,name,email,benefits,price,start,end,cust_type) values ("7397264570","karthik","karthik180499@gmail.com","1000GB","1075","2020-02-01","2020-03-02","Broadband");
insert into billing_customer (phno,name,email,benefits,price,start,end,cust_type) values ("7985346570","Rupika","rupanithya@gmail.com","200MB","19","2020-07-18","2020-07-20","Prepaid");
insert into billing_customer (phno,name,email,benefits,price,start,end,cust_type) values ("9865764872","Akash","akashkumar2000@gmail.com","2GB","179","2020-05-08","2020-06-05","Prepaid");
insert into billing_customer (phno,name,email,benefits,price,start,end,cust_type) values ("9829827652","Vignesh","vicky1001@gmail.com","3000GB","2999","2020-10-01","2020-11-01","Broadband");
insert into billing_customer (phno,name,email,benefits,price,start,end,cust_type) values ("9003260106","Pooja","poojaboobalan@gmail.com","150GB","999","2020-01-01","2020-12-31","Postpaid");
insert into billing_customer (phno,name,email,benefits,price,start,end,cust_type) values ("9043618661","Harini","harinichandrasegaran@gmail.com","150GB","999","2020-01-01","2020-12-31","Postpaid");
insert into billing_customer (phno,name,email,benefits,price,start,end,cust_type) values ("9787525867","Ashwin","ashwinsylesh@yahoo.com","2GB","179","2020-08-03","2020-09-05","Prepaid");
insert into billing_customer (phno,name,email,benefits,price,start,end,cust_type) values ("9870654326","Surya","suryasathish@gmail.com","1000GB","1075","2020-03-01","2020-04-02","Broadband");
select * from billing_customer;


CREATE TABLE paymenthistory (
    Billid int NOT NULL AUTO_INCREMENT,
    name varchar(25) NOT NULL,
    email varchar(50),
	mobile varchar(10),
    cname varchar(25),
    cnum varchar(16),
    expmonth varchar(20),
    expyear varchar(10),
    cvv int,
    PRIMARY KEY (Billid)
);
INSERT INTO paymenthistory (name,email,mobile,cname,cnum,expmonth,expyear,cvv)
VALUES ('Rupika','rupanithya98@gmail.com','8056147121','Rupika G','1111222233334444','January','2024',123),('Snehaa','snenithya@gmail.com','8945147121','Rupika G','1111222233334454','January','2024',153);
select * from paymenthistory;

