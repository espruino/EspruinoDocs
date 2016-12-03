/* Copyright (c) 2016 Steven Lazidis. See the file LICENSE for copying permission. */
/*
MySensors module for Espruino
*/


function MySensors(i) {
  if(isNaN(i) || i > 255) {
    this.nodeId = 255;
  } else {
    this.nodeId = i;
  }
}

MySensors.prototype.connection = {
  write:function(){console.log("No Gateway");}
};

MySensors.prototype.nodeId = 255;

MySensors.prototype.fragment = "";


MySensors.prototype.parse = function(x) {
  print(x);
  var msgs = x.split("\n");
  msgs[0] = this.fragment + msgs[0];
  this.fragment = msgs.pop();
  for(var i=0; i < msgs.length;i++) {
    var parts = msgs[i].split(";");
    parts[5] = parts.slice(5).join(";");
    this.handler(parts.slice(0,6));
  }
};


MySensors.prototype.present = function(sensor,type) {
  var msg = this.newMessage(sensor,type);
  msg.payload = "2.0";
  msg.messageType = 0;
  this.send(msg);
};

MySensors.prototype.newMessage = function(sensor,type) {
  return {
    nodeId:this.nodeId,
    childSensorId:sensor,
    messageType:1,
    ack:0,
    subType:type,
    payload:""
  }
};


MySensors.prototype.send = function(msg) {
  console.log("No Gateway");
};

MySensors.prototype.handler = function(y) {
  if(y[0] == JSON.stringify(this.nodeId)) {
    switch (y[2]) {
      case "1":
      case "2":
        var msg = this.newMessage(y[1],y[4]);
        msg.nodeId = y[0];
        msg.ack = y[3];
        msg.messageType = y[2];
        msg.payload = y[5];
        this.emit('receive',msg);
        break;
      case "3":
        switch(y[4]) {
          case "19":
            this.emit('presentation');
            break;
          case "4":
            var newId = JSON.parse(y[5]);
            if (!isNAN(newId)) {
              this.nodeId = newId;
              this.emit('presentation');
            }
            break;
          default:
            console.log("message subtype not implemented:"+y);
        }
        break;
      default:
        console.log("message type not implemented:"+y);
    }
  }
};


MySensors.prototype.setMqttGW = function(g,p,s) {
  this.connection = g;
  this.pubtopic = p;
  this.subtopic = s;
  this.connection.on('message',(function(msg){
    var parts = msg.topic.split("/").slice(1);
    this.parse(parts.join(";")+";"+msg.message+"\n")
  }).bind(this));
  this.send = (function(msg){
    this.connection.publish(
      this.pubtopic+"/"+msg.nodeId+"/"+msg.childSensorId+"/"+msg.messageType+"/"+msg.ack+"/"+msg.subType,
      JSON.stringify(msg.payload)
    );
  }).bind(this);
  this.connection.subscribe(this.subtopic+"/+/+/+/+/+");
  this.emit('presentation');
}

MySensors.prototype.setSerialGW = function(g) {
  this.connection = g;
  this.connection.on('data',this.parse.bind(this));
  this.send = (function(msg){
    var output = msg.nodeId+";"+msg.childSensorId+";"+msg.messageType+";"+msg.ack+";"+msg.subType+";"+JSON.stringify(msg.payload)+"\n";
    this.connection.write(output);
  }).bind(this);
  this.emit('presentation');
}

MySensors.prototype.disconnectGW = function() {
  this.connection = {};
  this.send = function(){console.log("No Gateway");}
}

exports.create = function (i) {
  return new MySensors(i);
};
