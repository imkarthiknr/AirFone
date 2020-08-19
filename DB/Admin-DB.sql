show databases;
use airfone;

create table adminprofile(admin_id int primary key auto_increment,uname varchar(20),pass varchar(20));
insert into adminprofile(uname,pass)values("hayath","hayath");
select * from adminprofile;
update adminprofile set uname="gokul" , pass="gokul" where  admin_id="";

