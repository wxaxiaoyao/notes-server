
use note;

desc classifyTags;

show triggers;

-- 分类tag删除触发器
-- 删除打上对应tag的记录中的tag
delimiter //
create trigger t_classifyTags_delete_after after delete on classifyTags for each row
begin
	declare x_tag varchar(255);
    declare x_userId bigint;
    set x_tag = OLD.tagname, x_userId = OLD.userId;
	if OLD.classify = 1 then
		update contacts set tags=json_remove(tags, json_unquote(json_search(tags, "one", x_tag))) where id > 0 and userId = x_userId and json_search(tags, 'one', x_tag) is not null;		
    end if;
end //
delimiter ;
drop trigger t_classifyTags_delete_after;

-- t_classifyTags_delete_after触发器测试
select * from classifyTags;
select * from contacts;
update contacts set tags=json_array("tag", "tag1", "tag2") where id = 1;
insert into classifyTags(userId, classify, tagname, createdAt, updatedAt) values(1, 1, 'tag', current_time(), current_time());
delete from classifyTags where id = 1;