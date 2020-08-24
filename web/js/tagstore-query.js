$(function() {

    $("#btn").click(function() {

        var tags = $.trim($("[name=tags]").val());
        var list = tags.split(","); 
        var i;
        var text = "";
        urlinfo = window.location.href;
        len=urlinfo.length;
        offset=urlinfo.indexOf("#");
        newsidinfo=urlinfo.substr(offset,len);
        newsids=newsidinfo.split("&");
        token= newsids[0].split("#id_token=");
        for (i = 0; i < list.length; i++) {
          if(i != list.length - 1){
              text += "tags=" + list[i] + "&";}
            else if(i==list.length -1){text += "tags=" + list[i];}
            }       
        var url = "https://jkzqp9x3hi.execute-api.us-east-1.amazonaws.com/dev/tasks?" + text;
        //$.get(url, function(data) {$("pre").text(JSON.stringify(data, null, 2));});
        $.ajax({
            type: "GET",
            dataType: 'json',
            url: url,
            headers: {"Authorization": token[1]},
            success : function(data) {$("pre").text(JSON.stringify(data, null, 2));},
            error: function (xhr,ajaxOptions,throwError){alert("error")},
            });
    });
    });