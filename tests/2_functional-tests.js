const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  
     suite('GET /api/stock-prices/ => stock', function() {
       
       let likeforgoog;
       let likeformsft
       
       test('View one stock', function(done) {
            chai.request(server)
            .get('/api/stock-prices/')
            .query({stock:'MSFT'})
            .end(function(err, res){
                assert.property(res.body, "stockData");
                assert.property(res.body.stockData, "stock");
                assert.property(res.body.stockData, "price");
                assert.property(res.body.stockData, "likes");
                assert.equal(res.body.stockData.stock, "MSFT");
                likeformsft = res.body.stockData.likes;
                done();
            })
       })
       
       test('View one stock and like it',function(done){
            this.timeout(100000);
            chai.request(server)
            .get('/api/stock-prices/')
            .query({stock:'GOOG',like:true})
            .end(function(err,res){
                likeforgoog = res.body.stockData.likes;
                assert.property(res.body, "stockData");
                assert.property(res.body.stockData, "stock");
                assert.property(res.body.stockData, "price");
                assert.property(res.body.stockData, "likes");
                assert.equal(res.body.stockData.stock, "GOOG");
                assert.isNumber(res.body.stockData.likes);
                done();
            })
       })
       
        test('View one stock and like it again',function(done){
           chai.request(server)
           .get('/api/stock-prices/')
           .query({stock:'GOOG',like:true})
           .end(function(err,res){
             assert.property(res.body, "stockData");
                assert.property(res.body.stockData, "stock");
                assert.property(res.body.stockData, "price");
                assert.property(res.body.stockData, "likes");
                assert.equal(res.body.stockData.stock, "GOOG");
                assert.isNumber(res.body.stockData.likes);
                assert.equal(res.body.stockData.likes,likeforgoog);
                done();
           })
       })
   
       
         test('View two stocks',function(done){
         chai.request(server)
         .get('/api/stock-prices/')
         .query({stock:['GOOG','MSFT']})
         .end(function(err,res){
                assert.property(res.body, "stockData");
                assert.isArray(res.body.stockData);
                assert.equal(res.body.stockData[0]['stock'], "GOOG");
                assert.equal(res.body.stockData[1]['stock'], "MSFT");
                assert.property(res.body.stockData[0], "rel_likes");
                assert.property(res.body.stockData[1], "rel_likes");
                done();
         })
       })
       
       test('View two stocks AND like them',function(done){
         chai.request(server)
         .get('/api/stock-prices/')
         .query({stock:['GOOG','MSFT']})
         .end(function(err,res){
                assert.property(res.body, "stockData");
                assert.isArray(res.body.stockData);
                assert.equal(res.body.stockData[0]['stock'], "GOOG");
                assert.equal(res.body.stockData[1]['stock'], "MSFT");
                assert.property(res.body.stockData[0], "rel_likes");
                assert.property(res.body.stockData[1], "rel_likes");
                assert.equal(res.body.stockData[0]['rel_likes'], likeforgoog-likeformsft);
                assert.equal(res.body.stockData[1]['rel_likes'], likeformsft-likeforgoog);
                done();
         })
       })
     })  
});
