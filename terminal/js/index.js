function getdir(dir) {
  var dir_list = [];
  $.ajax({
    url: dir,
    async: false,
    success: function(data){
      var folder;
      $(data).find(element_to_search).each(function(){
        folder=$(this).attr('href');
        dir_list.push(folder);
      });
    }
  });
  return dir_list;
};


function appendlist(list){
  list.shift();
  files= list.toString().replace(/,/g,' ');
  $('#term').append('<p>' +files+ '</p>');
};

function appendoutput(file_content){
  $('#term').append('<p>' + file_content + '<p/>');
}

appendlist(getdir(directory));

function appendCommand(command){
  var span = document.getElementById('root').innerHTML;
  $('#term').append('<p><span class="user">' + span + '</span> $ ' + command + '</p>' );

};

function changeCommand(path){
  document.getElementById('root').innerHTML = bash + path;
};

/* Clear Screen, Input, AutoScroll */
function clearInput(){
  document.getElementById('command').value="";
};

function clearScreen(){
  document.getElementById('term').innerHTML="";
};

function autoscroll(){
  var objDiv = document.getElementById("term");
  objDiv.scrollTop = objDiv.scrollHeight;
};

function setcommand(index){
  document.getElementById('command').value=lastcommands[index];
}

function openHelp(){
  readHelpFile('terminal/help.txt');
  $('#help').openModal();
}
/* Read File  */
function readTextFile(file, command)
{
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                appendCommand(command);
                appendoutput(allText);
                autoscroll();

            }
        }
    }
    rawFile.send(null);
}

function readHelpFile(file){
  var rawFile = new XMLHttpRequest();
  rawFile.open("GET", file, true);
  rawFile.onreadystatechange = function ()
  {
      if(rawFile.readyState === 4)
      {
          if(rawFile.status === 200 || rawFile.status == 0)
          {
              var allText = rawFile.responseText;
              $('#helptext').html(allText);
          }
      }
  }
  rawFile.send(null);
}


/*   Tab Key Funtionality    */
command.addEventListener("keydown", function (e) {
  /*  ALT - 18, TAB - 9 , CTRL - 17  */
  if (e.keyCode === 9) {
    e.preventDefault();

    var value = document.getElementById('command').value;
    var user_input= value.split(" ");
    var files = getdir(directory);
    console.log(user_input);
    var i=0; var file=user_input[0] + " ";
    if (user_input[1].length){
      for (i=0; i <files.length; i++){
        if ( files[i].startsWith(user_input[1])  ){
          file += files[i];
          break;
        }
      }

    }
    if (file.length){
      document.getElementById('command').value = file;
    }
  }
});


/*  ENTER Key Press | Funtionality of Commands   */
command.addEventListener("keydown", function (e) {
  /*  ALT - 18, TAB - 9 , CTRL - 17 , ENTER - 13 */
  if (e.keyCode === 13) {
    e.preventDefault();
    var command = document.getElementById('command').value.trim();
    lastcommands.push(command);
    commandindex=lastcommands.length;
    var user_input= command.toLowerCase().split(" ");
    switch (user_input[0]) {
      case 'ls':
        appendCommand(command);
        appendlist(getdir(directory));
        break;

      case 'vim':
      case 'vi':
      case 'cat':
      if(user_input[1].endsWith('txt')){
        var file_url = directory + user_input[1];
        readTextFile(file_url, command);
      }
      else{
        appendCommand(command);
        $('#term').append('<p>cat: Unable to read a directory. Try cd '+user_input[1]+'</p>');

      }

        break;

      case 'clear':
        clearScreen();
        break;

      case 'cd':
        if (user_input[1].endsWith('txt')){
          appendCommand(command);
          $('#term').append('<p>cd: '+user_input[1]+': Not a directory</p>');
        }
        else if ( (user_input[1]=='..') || (user_input[1]=='/') ){
          directory = '/terminal/content/';
          path ='';
          appendCommand(command);
          changeCommand(path);
        }
        else{
          directory+=user_input[1];
          path=user_input[1];
          appendCommand(command);
          changeCommand(path);
        }
        break;
        // CD Command end

      case 'help':
        appendCommand(command);
        autoscroll();
        readHelpFile('/terminal/help.txt');
        $('#help').openModal();
        break;

      default:
      appendCommand(command);
      $('#term').append('<p>'+command +' :Illegal Command</p>');
        break;

    }
    clearInput();
    autoscroll();

  }
});

command.addEventListener("keydown", function (e) {
  /*  ALT - 18, TAB - 9 , CTRL - 17  */
  if (e.keyCode === 38) { //Top Arrow Key
    e.preventDefault();
    if (commandindex>0){
      commandindex--;
      setcommand(commandindex);

  }
  }

  if (e.keyCode === 40){ // Down Arrow Key
    e.preventDefault();
    if (commandindex==lastcommands.length-1){
      clearInput();
      commandindex++;
    }
    else if (commandindex<lastcommands.length-1){
      commandindex++;
      setcommand(commandindex);
    }

  }
});

//NON Terminal Functions
