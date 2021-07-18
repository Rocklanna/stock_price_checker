'use strict';

const fetch    = require('node-fetch');
const mongoose = require('mongoose')

mongoose.connect(process.env.DB,{useNewUrlParser:true, useUnifiedTopology:true});

const ipstock = new mongoose.Schema({
  stock:{type:String,required:true},
  ip:{type:String,required:true}  
})

const iptostocklikes = mongoose.model("iptostocklikes",ipstock);

module.exports = async function (app) {

  app.route('/api/stock-prices')
    .get(function (req, res){
      let liker=[]
      var like;
      var stock = req.query.stock;
      var clickedlike = (req.query.like) ? 1 : 0;
      var ip = getipaddress(req);
       
    
    if(typeof stock ==="string"){
          var url = "https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/"+stock+"/quote";
          var urls =[url];
     
       if(clickedlike == 1){
         savelikes(stock,ip).then((value)=>{
              console.log("the value "+ value);
              var stockInfo = getapi(urls)
              var countedlikes = countlikes(stock)
              Promise.all([stockInfo,countedlikes])
                 .then(values=>{
                res.json({"stockData":{
                              "stock":values[0][0]["symbol"],
                              "price":values[0][0]["latestPrice"],
                              "likes":values[1][0]
                             }
                });// end of res.json
          }) // end of then
          })
       }
       else{
         var stockInfo = getapi(urls)
         var countedlikes = countlikes(stock)
         Promise.all([stockInfo,countedlikes])
                 .then(values=>{
                res.json({"stockData":{
                              "stock":values[0][0]["symbol"],
                              "price":values[0][0]["latestPrice"],
                              "likes":values[1][0]
                             }
                });// end of res.json
          }) // end of then
       }   
    }//end if for stock === string
    
    
    else {
        var url1 = "https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/"+stock[0]+"/quote";
        var url2 = "https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/"+stock[1]+"/quote";
        var urls =[url1,url2];
      
        if(clickedlike == 1){
                  
       
          
          savelikes(stock,ip).then((value)=>{
              console.log("  nvalue");
              var stockInfo = getapi(urls)
              var countedlikes = countlikes(stock)
              Promise.all([stockInfo,countedlikes])
              .then(values=>{
                     res.json({"stockData":
                        [
                         {"stock":values[0][0]["symbol"],
                         "price":values[0][0]["latestPrice"],
                         "rel_likes":values[1][0]-values[1][1]
                         },
                        {"stock":values[0][1]["symbol"],
                         "price":values[0][1]["latestPrice"],
                         "rel_likes":values[1][1]-values[1][0]
                        } 
                       ]})  
        })
          })
       }
       else{
         var stockInfo = getapi(urls)
         var countedlikes = countlikes(stock)
         Promise.all([stockInfo,countedlikes])
              .then(values=>{
                    res.json({"stockData":
                        [
                         {"stock":values[0][0]["symbol"],
                         "price":values[0][0]["latestPrice"],
                         "rel_likes":values[1][0]-values[1][1]
                         },
                        {"stock":values[0][1]["symbol"],
                         "price":values[0][1]["latestPrice"],
                         "rel_likes":values[1][1]-values[1][0]
                        } 
                       ]})   
        })
       }   
      
                
        
  }// end else
    }); // end of get route
    
};

async function getapi (urls){
   
  try{
       var data = await Promise.all(
                        urls.map(url=>
                           fetch(url,{method:"GET"})
                          .then(response=>response.json())
                          ))
       return data;// data is an array with each index being data from each url;
  }
  catch(err){
    console.error(err);
  }
   
}

function getipaddress(request){  
  var ipaddress = (request.headers['x-forwarded-for'] || 
            request.connection.remoteAddress || 
            request.socket.remoteAddress || 
            request.connection.socket.remoteAddress).split(",")[0];

  return ipaddress;
}

function countlikes(stock){
  
     if(typeof stock ==="string"){
  
        try{
            var data = Promise.all([iptostocklikes.where({stock: stock}).countDocuments()])
            return data;// data is an array with each index being data from each url;
        }
        catch(err){
            console.error(err);
        }     
     }//end if
  
    else{  
        try{
             var data = Promise.all(
                           stock.map(perstock=>
                              iptostocklikes.where({stock: perstock}).countDocuments()
                             ))
             return data;// data is an array with each index being data from each url;
        }
        catch(err){
             console.error(err);
        }  
   }// end of else
}// end of function likeable



function savelikes(stock,ip){
  
  if(typeof stock ==="string"){
       try{ 
          var datatoDB = new iptostocklikes({stock:stock, ip:ip});
          var saved = Promise.resolve( iptostocklikes.find({stock:stock, ip:ip}, function (err,result){
               if(err){
                    console.log("Error occured, please try again");
               }// end of if for err
               else if(!result.length){
                    datatoDB.save();        
               } // end of elseif
           })
           )
           console.log(saved);
           return saved
       }// end try
       catch(err){
    console.error(err);
      }
  } 
  
  else{
       try{
           var saved = Promise.all( stock.map((perstock) => {
               var datatoDB = new iptostocklikes({stock:perstock, ip:ip});      
               iptostocklikes.find({stock:perstock, ip:ip}, function (err,result){
               if(err){
                    console.log("Error occured, please try again");
               }// end of if for err
               else if(!result.length){
                   datatoDB.save();        
               } // end of elseif
           })
           }) // end of map
         ) // end of Promise.all   
         //console.log("saved is" + saved);
         return saved  
    }// end of try  
    catch(err){
      console.error(err);
    }//end of catch
    
  }// end of else
  
}// end of save likes
