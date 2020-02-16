//Laden der API
var mineflayer = require('mineflayer');
//Die Plugins initialisieren
var navigatePlugin = require('mineflayer-navigate')(mineflayer);
var scaffoldPlugin = require('mineflayer-scaffold')(mineflayer);
var blockFinderPlugin = require('mineflayer-blockfinder')(mineflayer);
//Variabeln festlegen
var mined = 0;
var returnPos;

//Den eigentlichen Bot erstellen
var bot = mineflayer.createBot({
  host: "localhost", 
  port: 25565,       
  username: "Bot", 
});
//Plugins laden
navigatePlugin(bot);
scaffoldPlugin(bot);
blockFinderPlugin(bot);
bot.loadPlugin(blockFinderPlugin);

function depositItem(chest){
  //Diamanten in dieKiste hinzufügen, bis keine mehr übrig sind.
  chest.deposit(264, null, null, (err) => {
    if (err) {
      bot.chat(`unable to deposit `)
      chest.close();
    } else {
      console.log(`deposited`)
      depositItem(chest);
      
    }
  })
}

//Hauptfunktion durch welche der Bot den Command mine ausführen kann
function mine(){
  //var origin = bot.entity.position;
  //Der Bot sucht nach einem Diamant Ore
  bot.findBlock({
    point: bot.entity.position,
    matching: 56,
    maxDistance: 100,
    count: 1,
  }, function(err, blocks) {
    if (err) {
      bot.chat('[DIA FINDEN] Error: ' + err);
      return;
    }
    //Wenn ein block gefunden wurde und er das Limit noch nicht erreicht hat Führt er if aus
    if (blocks.length && mined < 3) {
      //Der Bot bewegt sich zu der Position den Blockes
      bot.scaffold.to(blocks[0].position, function(err) {
        if (err) {
            bot.chat("[BLOCK FINDEN] Error: " + err.code);
        } 
        else {
          bot.chat("Angekommen am Block");
          //die Anzahl der abgebauten blöcke wird um 1 erhöt
          mined++;
          //die Funktion ruft sich selbst erneut auf
          mine();
        }
      });
      return;
    //Sollte er kein Block gefunden haben oder das limit ereicht haben wird else ausgeführt  
    } else {
      bot.chat("Ich konnte keine weitere Diamanten finden oder habe die gewünschte anzahl Abgebaut");
      bot.chat("Ich komme zu dir. Bitte steh still");
      //var t = bot.players['JumpyStyle'].entity;
      //der Bot bewegt sich zu dem Spieler
      //var r = returnPos.position;
      bot.scaffold.to(returnPos.position, function(err) {
        if (err) {
          bot.chat("[ZURÜCK ZUR RETURN POS] Error: " + err.code);
        } else {
          bot.chat("Bei dir angekommen. Suche nach Kiste");
          //der bot sucht nach einer Kiste
          bot.findBlock({
            point: bot.entity.position,
            matching: 54,
            maxDistance: 256,
            count: 1,
          }, function(err, blocks) {
            if (blocks.length) {
              bot.chat('Kiste gefunden bei ' + blocks[0].position + '.');
              //Die postition verändern, sodass der Bot nicht die Kiste abbaut
              //zur Kiste hingehen
              bot.scaffold.to(blocks[0].position.offset(0, 0, 1), function(err) {
                if (err) {
                  bot.chat("[ZU SPIELER GEHEN] Error: " + err.code);
                } else {
                  //die Kiste öffnen
                  var chest = bot.openChest(blocks[0]);
                  chest.on('open', () => {
                    depositItem(chest);
                  })
                  
                  }
              });
              
              return;
            } else {
              bot.chat("[KISTE FINDEN] Error: ");
              return;
            }
          });
          //const [dia] = bot.inventory.items().filter(({ name }) => name === 'diamond')
          //bot.tossStack(dia)
        }
      });
      return;
    }
  });}
  
bot.on('chat', function(username, message) {
  if (username === bot.username) return;
  //target wird auf den verfasser der Message gelegt
  var target = bot.players[username].entity;
  //Wenn die Message mine lautetd wird dies Aufgerufen
  if (message === 'mine'){
    bot.chat('Ich habe verstanden');
    //sobald der Befehl gegeben wird wird die position des Spielers gespeichert
    returnPos = bot.players[username].entity;
    mine();
    //die Anzahl der abgebauten blöcke wird zurückgesetzt
    mined = 0;
    }
  //Wenn die Message komm lautetd wird dies Aufgerufen
  if (message === 'come') {
    //der Bot bewegt sich zu dem Spieler
    bot.scaffold.to(target.position, function(err) {
      if (err) {
        bot.chat("[ZU SPIELER GEHEN] Error: " + err.code);
      } else {
        bot.chat("Ich bin da");
      }
    });
    
  }
});