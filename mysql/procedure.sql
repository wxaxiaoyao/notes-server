use note;

delimiter //
create procedure user_portrait() modifies sql data
begin
declare x_username varchar(128);
declare x_portrait varchar(256);
declare x_nickname varchar(128);
declare x_id bigint;
declare x_no_more_record int default 0;
declare x_user_cursor cursor for select id, username, nickname, portrait from users;
declare continue handler for not found set  x_no_more_record = 1; /*这个是个条件处理,针对NOT FOUND的条件,当没有记录时赋值为1*/
open x_user_cursor;
repeat
	fetch x_user_cursor into x_id, x_username, x_nickname, x_portrait;
    -- select x_id, x_portrait;
    if x_portrait is null then
		set x_portrait = concat('http://statics.qiniu.wxaxiaoyao.cn/_/portraits/', left(x_username,1), "1.png");
        update users set portrait=x_portrait where id = x_id;
    end if;
    if x_nickname is null then
		update users set nickname=x_username where id = x_id;
    end if;
until x_no_more_record end repeat;
close x_user_cursor;
end //
delimiter ;
drop procedure user_portrait;
call user_portrait();
select * from users;

select * from classifyTags;

delimiter //
CREATE FUNCTION `lat_lng_distance` (lat1 FLOAT, lon1 FLOAT, lat2 FLOAT, lon2 FLOAT)
RETURNS FLOAT
DETERMINISTIC
BEGIN
	RETURN ROUND(6378.138 * 2 * ASIN(SQRT(POW(SIN((lat1 * PI() / 180 - lat2 * PI() / 180) / 2), 2) + COS(lat1 * PI() / 180) * COS(lat2 * PI() / 180) * POW(SIN(( lon1 * PI() / 180 - lon2 * PI() / 180 ) / 2), 2))),2);
END //
delimiter ;
