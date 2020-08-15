var len;
function getdata(){
    var temp = [];
    var moist = [];
    var date = [];
    var wl = [];
    var i=0;
    
    $.ajax( { url: 'https://api.mlab.com/api/1/databases/obs/collections/udatas?q='+val+'&l=100000&apiKey=KfwIMojFrClgp5HSyGF0U-NUyMWNyNmA',
}).done(function(datas){
        len = datas.length-30;
        console.log(len);
    });
    $.ajax( { url: 'https://api.mlab.com/api/1/databases/obs/collections/udatas?q='+val+'&sk='+len+'&l=50&apiKey=KfwIMojFrClgp5HSyGF0U-NUyMWNyNmA',
}).done(function(datas){    
        console.log(len);     
        datas.forEach(data => {
            temp.push(data.temperature);
            moist.push(data.moisture);
            wl.push(data.waterLevel);
            date.push(++i);
        });  
        console.log(temp);
        //drawchart();
        new Chart(document.getElementById("tempchart"), {
            type: 'line',
            data: {
                labels: date,
                datasets: [{ 
                    data: temp,
                    label: "Temperature",
                    borderColor: "#3e95cd",
                    fill: false
                }]
            },
            options: {
                title: {
                    display: true,
                    text: 'Last 30 Sensor Data'
                }
            }
        }); 

        new Chart(document.getElementById("moistchart"), {
            type: 'line',
            data: {
                labels: date,
                datasets: [{ 
                    data: moist,
                    label: "Moisture",
                    borderColor: "#8e5ea2",
                    fill: false
                }]
            },
            options: {
                title: {
                    display: true,
                    text: 'Last 30 Sensor Data'
                }
            }
        }); 

        new Chart(document.getElementById("wlchart"), {
            type: 'line',
            data: {
                labels: date,
                datasets: [{ 
                    data: wl,
                    label: "Water Level",
                    borderColor: "#df0839",
                    fill: false
                }]
            },
            options: {
                title: {
                    display: true,
                    text: 'Last 30 Sensor Data'
                }
            }
        }); 
    });
}  


setInterval(getdata,15000);