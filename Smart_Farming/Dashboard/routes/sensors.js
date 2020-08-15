const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

//Load Helper
const {ensureAuthenticated} = require('../helpers/auth');

//Load SensorData Model
require('../models/SensorData');
const Sdata = mongoose.model('udata');

//Show Sensor Page
// router.get('/',(req,res)=>{
//     res.render('sensors/sensor')
// });

router.get('/home',ensureAuthenticated, (req,res)=>{
    res.render('./sensors/home');
})

router.get('/sensor', ensureAuthenticated,(req,res)=>{
   res.render('./sensors/sensor');
});

router.get('/history',ensureAuthenticated,(req,res)=>{
    Sdata.find({})
        .sort({date: 'desc'})
        .limit(100)
        .then(udata=>{
            res.render('./sensors/history',{
                udata : udata
            });
        });
});

router.get('/report',ensureAuthenticated,(req,res)=>{
    res.render('./sensors/analysisForm');
});

router.post('/report',ensureAuthenticated,(req,res)=>{
    var nodeId = req.body.node;
    var sdate = req.body.date1;
    var edate = req.body.date2;
    var start = sdate.split("-");
    var end = edate.split("-");
    var startN = [];
    var endN = [];
    var dateRange = [];
    var maxTemp = [];
    var minTemp = [];
    var maxMoist = [];
    var minMoist = [];
    var maxWl = [];
    var minWl = [];
    var avgTemp = [];
    var avgMoist = [];
    var avgWl = [];
    var tempArr = [];
    var moistArr = [];
    var wlArr = [];
    var i = 0;

    function maxminavg(temp,moist,wl){
        maxTemp.push(Math.max(...temp));
        maxMoist.push(Math.max(...moist));
        maxWl.push(Math.max(...wl));

        minTemp.push(Math.min(...temp));
        minMoist.push(Math.min(...moist));
        minWl.push(Math.min(...wl));



        let sumtemp = temp.reduce((previous, current) => current += previous);
        avgTemp.push((sumtemp/temp.length).toFixed(3));

        let summoist = moist.reduce((previous, current) => current += previous);
        avgMoist.push((summoist/moist.length).toFixed(3));

        let sumwl = wl.reduce((previous, current) => current += previous);
        avgWl.push((sumwl/wl.length).toFixed(3));

        let tempJson = {"date":dateRange[i],"maxTemp":maxTemp[i],"minTemp":minTemp[i],"avgTemp":avgTemp[i]};
        let moistJson = {"date":dateRange[i],"maxMoist":maxMoist[i],"minMoist":minMoist[i],"avgMoist":avgMoist[i]};
        let wlJson = {"date":dateRange[i],"maxWl":maxWl[i],"minWl":minWl[i],"avgWl":avgWl[i]};
        tempArr.push(tempJson);
        moistArr.push(moistJson);
        wlArr.push(wlJson);
        i++;
    }


    var getDates = function(startDate, endDate) {
        var dates = [],
            currentDate = startDate,
            addDays = function(days) {
              var date = new Date(this.valueOf());
              date.setDate(date.getDate() + days);
              return date;
            };
        while (currentDate <= endDate) {
          dates.push(currentDate);
          currentDate = addDays.call(currentDate, 1);
        }
        return dates;
      };

    for(var j=0;j<3;j++){
        startN[j] =parseInt(start[j]);
        endN[j] = parseInt(end[j]); 
    }
    var startDate = new Date(startN[0],startN[1]-1,startN[2]+1);
    var endDate = new Date(endN[0],endN[1]-1,endN[2]+1);

    //console.log(typeof startN[0]);
    // Usage
    var dates = getDates(startDate, endDate);                                                                                                           
    dates.forEach(function(date) {
      dateRange.push(date.toISOString().split('T')[0]);
    });
    // console.log(dateRange);
    
    dateRange.forEach(date => {
        Sdata.find({})
        .where("date").equals(date)
        .where("device").equals(nodeId)
        .then(udata =>{
            let eachDateTemp = [];
            let eachDateMoist = [];
            let eachDateWl = [];
            if(udata.length>0){
                udata.forEach(data => {
                    eachDateTemp.push(data.temperature);
                    eachDateMoist.push(data.moisture);
                    eachDateWl.push(data.waterLevel);
                });
                maxminavg(eachDateTemp,eachDateMoist,eachDateWl);
            }
            //console.log(eachDateValue);
        });
    });

   setTimeout(function(){
        res.render('./sensors/analysis',{
            tempJson : tempArr,
            moistJson : moistArr,
            wlJson : wlArr
        })
   },10000);
       
    
});



router.get('/weather',ensureAuthenticated,(req,res)=>{
    res.render('./sensors/weather');
});

module.exports = router;