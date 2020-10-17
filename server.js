


const express = require('express');
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));
const { check, validationResult } = require('express-validator')

app.use(bodyParser.json())
app.use(bodyParser.raw())

const port = 3000;
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');
const axios = require('axios');


const options = {
  swaggerDefinition: {
    info: {
      title: 'Personal API',
      version: '1.0.0',
      description: 'Sample Api',

    },
    host: '64.227.10.84:3000',
    basePath: '/',
  },
  apis: ['./server.js'],


  // <-- not in the definition, but in the options
};

const specs = swaggerJsdoc(options);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use(cors());

/**
 * @swagger
 * /company:
 *   get:
 *    summary: "Find all customers"
 *    description: Return all customers
 *    produces:
 *          -application/json
 *    responses:
 *          200:
 *              description: Object array of companies
 */

/**
 * @swagger
 * /company:
 *   post:
 *    summary: "Add new companies"
 *    description: Return companies
 *    parameters:
 *      - in: body
 *        name: user
 *        description: The user to create.
 *        schema:
 *         type: object
 *         required:
 *           - cid
 *         properties:
 *            cid:
 *               type: string
 *            cname:
 *               type: string   
 *    responses:
 *          200:
 *              description: Object array of new companies
 *          400:
 *              description: Invalid data
 */

/**
 * @swagger
 * /company/{cid}:
 *   put:
 *    summary: "Update/Insert specific companies"
 *    description: If cid, updates cname from req.body, else inserts new field 
 *    parameters:
 *      - name : cid
 *        in: path
 *        description: Enter company id
 *        type: string
 *        required: true
 *      - in: body
 *        name: user
 *        description: JSON data to update/insert fields.
 *        schema:
 *         type: object
 *         required:
 *           - cid
 *         properties:
 *            cid:
 *               type: string
 *            cname:
 *               type: string   
 *    responses:
 *          200:
 *              description: updated record
 *          400:
 *              description: Invalid data
 */

/**
 * @swagger
 * /company/{cid}:
 *   patch:
 *    summary: "Update specific companies"
 *    description: If cid, updates cname from req.body, else throw error
 *    parameters:
 *      - name : cid
 *        in: path
 *        description:  Enter company id
 *        type: string
 *        required: true
 *      - in: body
 *        name: user
 *        description: JSON data to update fields.
 *        schema:
 *         type: object
 *         required:
 *           - cid
 *         properties:
 *            cid:
 *               type: string
 *            cname:
 *               type: string   
 *    responses:
 *          200:
 *              description: updated record
 *          400:
 *              description: Invalid data
 */

/**
 * @swagger
 * /company:
 *   delete:
 *    summary: "Delete specific companies"
 *    description: Return companies
 *    parameters:
 *      - in: body
 *        name: user
 *        description: Require cid to delete the entry.
 *        schema:
 *         type: object
 *         required:
 *           - cid
 *         properties:
 *            cid:
 *               type: string
 *    responses:
 *          200:
 *              description: Record deleted
 *          400:
 *              description: Invalid data
 */





const mariadb = require('mariadb');

const pool = mariadb.createPool({


  host: '64.227.10.84',
  user: 'root',

  password: 'root',
  database: 'sample',
  port: 3306,
  connectionLimit: 5
  //socketPath: '/var/lib/mysqld/mysqld.sock'
});
// app.get('/',function (req, res) {
//     res.send('index');
// });

// app.get("/", function (req, res) {
//   res.sendFile(__dirname + "/index.html");
// });


app.get('/company', function (req, res) {

  //async function asyncFunction() {


  pool.getConnection()
    .then(conn => {

      conn.query("SELECT * from company")
        .then((rows) => {
          res.setHeader("Content-Type", "application/json");
          res.json(rows);
          conn.end();
          //[ {val: 1}, meta: ... ]


        })
        .catch(err => {
          //handle error
          console.log(err);
          conn.end();
        })

    }).catch(err => {
      //not connected
    });



})

app.get('/say', function(req, res){
  if(req.query && req.query.keyword){

  axios.get('https://ogbvn1gmrc.execute-api.us-east-2.amazonaws.com/test/say?keyword='+[req.query.keyword])
  
  .then(response=>res.json(response.data))
  .catch(err=> console.log(err));
  console.log("param",req.query.keyword);
  }
  else
  res.send('please enter the keyword');
}
)


app.post('/company', [
  check('req.body.cid').isLength({ max: 6 })

], function (req, res) {

  const errors = validationResult(req);
  console.log("here", req.body);
  if (!errors.isEmpty())
    return res.status(400).jsonp(errors.array());

  //async function asyncFunction() 
  console.log("req", req.params, req.body)
  console.log(req.body.cid);



  pool.getConnection()
    .then(conn => {
      if (!req.body.cid || !req.body.cname)
        return res.status(400).send({ error: true, message: 'Please provide id and name ' });
      var q = "INSERT INTO company (COMPANY_ID, COMPANY_NAME) VALUES (\'" + [req.body.cid] + "\' \, \'" + [req.body.cname] + "\')";

      conn.query(q)
        .then((rows) => {
          res.setHeader("Content-Type", "application/json");
          res.json(rows);
          //[ {val: 1}, meta: ... ]


        })
        .catch(err => {
          //handle error
          res.send(err);
          console.log(err);
          conn.end();
        })

    }).catch(err => {
      //not connected
    });
})

app.put('/company/:cid',[
  check("cid").isLength({ max: 6 }),
  check('cid').isLength({ max: 6 })],
  function (req, res) {

    const errors = validationResult(req);
    console.log("here", errors);
    if (!errors.isEmpty()){
          
      return res.status(422).jsonp(errors.array());
        
        }
    else{
    //async function asyncFunction() {


    pool.getConnection()
      .then(conn => {

        // sql query
        conn.query("SELECT * from company WHERE COMPANY_ID='" + [req.params.cid] + "'").then((d) => {
          console.log(d);
          if (d.length != 0) {
            // if(!req.body.cid)
            // return res.status(400).send({ error:true, message: 'Please provide only name ' });
            // if (!req.body.cname)
            //   return res.status(400).send({ error:true, message: 'Please provide only name ' });
            conn.query("UPDATE company SET COMPANY_NAME='" + [req.body.cname] + "' WHERE COMPANY_ID='" + [req.params.cid] + "'").then((rows) => {
              res.send(rows);
              conn.close();
              return;
            })

          } else {
            conn.query("SELECT * from company WHERE COMPANY_ID='" + [req.body.cid] + "'").then((d) => {
              console.log(d);
              if (d.length != 0) {
                return res.status(400).send({ error: true, message: 'Duplicate entry for cid' });
                conn.close();
              }
            })

            conn.query("INSERT INTO company(COMPANY_NAME, COMPANY_ID) VALUES ('" + [req.body.cname] + "', '" + [req.body.cid] + "')")
              .then((d) => {
                console.log("in else");
                res.send(d);
                conn.close();

              })
          }

        })
          .catch(err => {
            //handle error
            res.send(err);
            console.log(err);
            conn.end();
          })

      }).catch(err => {
        //not connected
      });
    }

  })

app.patch('/company/:cid',
  check('req.params.cid').isLength({ max: 6 }),
  check('req.body.cid').isLength({ max: 6 }),

  function (req, res) {

    const errors = validationResult(req);
    console.log("here", req.body);
    if (!errors.isEmpty())
      return res.status(400).jsonp(errors.array());

    //async function asyncFunction() {


    pool.getConnection()
      .then(conn => {

        // sql query
        conn.query("SELECT * from company WHERE COMPANY_ID='" + [req.params.cid] + "'").then((d) => {
          console.log(d);
          if (d.length == 0) {
            // if(!req.body.cid)
            // return res.status(400).send({ error:true, message: 'Please provide only name ' });
            // if (!req.body.cname)
            //   return res.status(400).send({ error:true, message: 'Please provide only name ' });
            res.status(400).send({ error: true, message: 'Company with the id doesnt exist ' });
            res.send(rows);
            conn.close();
            return;
          }

          else {

            conn.query("UPDATE company SET COMPANY_NAME='" + [req.body.cname] + "' WHERE COMPANY_ID='" + [req.params.cid] + "'").then((rows) => {
              res.send(rows);

              conn.close();
              return;


            })
          }
        })


          .catch(err => {
            //handle error
            res.send(err);
            console.log(err);
            conn.end();
          })

      }).catch(err => {
        //not connected
      });

  })

// app.patch('/company', function (req, res) {

//   //async function asyncFunction() {


//       pool.getConnection()
//   .then(conn => {
//     if (!req.body.cid || !req.body.cname)
//       return res.status(400).send({ error:true, message: 'Please provide id and name ' });
//     var q ="UPDATE company SET COMPANY_NAME= \'" + req.body["cname"]  +  "\'  WHERE COMPANY_ID= \'" + req.body["cid"]+"\'";
//     // UPDATE company SET COMPANY_NAME= \'" + req.body["cname"]  +  "\'  WHERE COMPANY_ID= \'" + req.params.id+"\'

//     conn.query(q)
//       .then((rows) => {
//           res.setHeader("Content-Type", "application/json");
//           res.json(rows);
//            //[ {val: 1}, meta: ... ]


//       })
//       .catch(err => {
//         //handle error
//         res.send(err);
//         console.log(err); 
//         conn.end();
//       })

//   }).catch(err => {
//     //not connected
//   });

// })
app.delete('/company', function (req, res) {

  //async function asyncFunction() {


  pool.getConnection()
    .then(conn => {
      if (!req.body.cid)
        return res.status(400).send({ error: true, message: 'Please provide id' });
      var q = "DELETE FROM company WHERE COMPANY_ID= \'" + [req.body.cid] + "\'";
      // UPDATE company SET COMPANY_NAME= \'" + req.body["cname"]  +  "\'  WHERE COMPANY_ID= \'" + req.params.id+"\'

      conn.query(q)
        .then((rows) => {
          res.setHeader("Content-Type", "application/json");
          res.json(rows);
          //[ {val: 1}, meta: ... ]


        })
        .catch(err => {
          //handle error
          res.send(err);
          console.log(err);
          conn.end();
        })

    }).catch(err => {
      //not connected
    });

})


app.listen(port, function () {


  console.log('app listening at http://localhost:${port}')
}); 
