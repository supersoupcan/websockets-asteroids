var app = require('../server');

app.listen(process.env.PORT, function (){
    console.log('app running on port ' + process.env.PORT);
});