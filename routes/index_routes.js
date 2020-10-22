const express = require('express');
const router = express.Router();
var app = express();
var mysql = require('mysql');
var con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'proj_v2',
    multipleStatements: true
});
con.connect(function (err) {
    if (err) throw err;
    console.log("database connected successfully");
});
//---------------------------------------------signup page call------------------------------------------------------
router.get('/signup', (req, res) => {
    var message = '';
    res.render('signup', {message: message});
})
router.post('/signup', (req, res) => {
    var message = '';

    var username = req.body.username,
        Fname = req.body.Fname,
        Lname = req.body.Lname,
        email = req.body.email,
        password = req.body.password,
        mobilenum = req.body.mobilenum,
        street = req.body.street,
        city = req.body.city,
        state = req.body.state;

    var q = 'INSERT INTO customers (`username`,`Fname`,`Lname`,`email`,`password`,`mobile_num`,`street`,`city`,`state`) VALUES(?,?,?,?,?,?,?,?,?)';
    var q1 = mysql.format(q, [username, Fname, Lname, email, password, mobilenum, street, city, state]);
    con.query(q1, function (err, results) {
        if (err) throw err;
        message = "Succesfully! Your account has been created.";
        res.render('signup.ejs', {message: message});
    });

})
//-----------------------------------------------login page call------------------------------------------------------
router.get('/login', (req, res) => {
    var message = '';
    var sess = req.session;
    res.render('index.ejs', {message: message});
});
var customer;

router.post('/login', (req, res) => {
    var message = '';
    var sess = req.session;
    var user_name = req.body.user_name;
    var password = req.body.password;

    var sql = "SELECT * FROM `customers` WHERE `username`='" + user_name + "' and password = '" + password + "'";
    con.query(sql, function (err, results) {
        if (results.length > 0) {
            console.log(results);
            customer = results[0].customer_id;
            console.log("customer id" + customer);
            req.session.userId = results[0].customer_id;
            req.session.user = results[0];
            userid = results[0].username;
            res.redirect('/home/dashboard');
        } else {
            console.log(err);
            message = 'Wrong Credentials.';
            res.render('index.ejs', {message: message});
        }

    });
})
//-----------------------------------------------dashboard page functionality----------------------------------------------
router.get('/home/dashboard', (req, res) => {
    var user = req.session.user,
        userId = req.session.userId;
    console.log('ddd=' + userId);
    if (userId == null) {
        res.redirect("/login");
        return;
    }
    var sql = "SELECT * FROM `customers` WHERE `customer_id`='" + userId + "'";

    con.query(sql, function (err, result) {
        res.render('dashboard.ejs', {data: result});
    });
})
//-------------account settings page-------------------//
router.get('/home/AccountSettings', (req, resp) => {
    var user = req.session.user,
        userId = req.session.userId;
    console.log('ddd=' + userId);
    if (userId == null) {
        resp.redirect("/login");
        return;
    }
    var sql = "SELECT * FROM `customers` WHERE `customer_id`='" + userId + "'";

    con.query(sql, function (err, result) {
        resp.render('AccountSettings.ejs', {data: result});
    });
})

//------------------updating account details--------------//
router.post('/home/AccountSettings/:id', (req, resp) => {
    var id = req.params.id;
    var Fname = req.body.Fname;
    var Lname = req.body.Lname;
    var mobile_num = req.body.mobile_num;
    var email = req.body.email;
    var street = req.body.street;
    var city = req.body.city;
    var state = req.body.state;
    var query_sql = "UPDATE customers SET Fname= ?,Lname=?,mobile_num=?,email=?,street=?,city=?,state=? WHERE customer_id=?";
    con.query(query_sql, [Fname, Lname, mobile_num, email, street, city, state, id], function (err, result) {
        if (err) {
            throw err;
        } else {
            resp.redirect('/home/dashboard');
        }
    })
    
});
//updating privacy settings for an account //
router.post('/home/AccountSettings/Privacy/:id', (req, resp) => {
    var id = req.params.id;
    var username = req.body.username;
    var password = req.body.password;
    var query_sql = "UPDATE customers SET username=?,password=? WHERE customer_id=?";
    con.query(query_sql, [username, password, id], function (err, result) {
        if (err) {
            console.log(err);
        } else {
            resp.redirect('/home/dashboard');
        }
    })
})
//------------------------------------logout functionality----------------------------------------------
router.get('/home/logout', (req, resp) => {
    req.session.destroy(function (err) {
        resp.redirect("/login");
    })
})
//-----------------------------------------------------------------------------//
//Gardening Routes//
router.get('/Gardening', (req, resp) => {
    resp.render('../views/Gardening/Gardening.ejs');
});
//Gardening --> Minature Sub Routes//
router.get('/Gardening/MiniatureGardens', (req, resp) => {
    var r = "SELECT products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=? LIMIT 3;SELECT products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=? LIMIT 3;SELECT products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=? LIMIT 3;"
    con.query(r, [1, 2, 3], function (err, result, fields) {
        if (err) throw err;
        var data = result;
        resp.render('../views/Gardening/MiniatureGardens.ejs', {data: data});
    });
});
//started garden kit routes//
router.get('/Gardening/MiniatureGardens/GardenKits', (req, resp) => {
    var q = "SELECT products.product_id,products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=1"
    con.query(q, function (err, result, fields) {
        if (err) throw err;
        var data = result;
        resp.render('../views/Gardening/GardenKits.ejs', {data: data});
    });
});
router.post('/GardenKits/:id', function (req, resp) {
    var userId = req.session.userId;
    if (userId == null) {
        resp.redirect("/login");
        return;
    }
    var Quantity = 1;
    var p = {Quantity:Quantity,Product_id: req.body.product_id, customer_id: customer};
    con.query('INSERT INTO cart_item SET ?', p, function (error, results) {
        if (error) {
            throw error;
        } else {
            resp.redirect('/Gardening/MiniatureGardens/GardenKits');
        }
    });
});

//completed garden kits routes//
router.get('/Gardening/MiniatureGardens/Terrariums', (req, resp) => {
    var x = "SELECT products.product_id,products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=2"
    con.query(x, function (err, result, fields) {
        if (err) throw err;
        var data = result;
        resp.render('../views/Gardening/Terrariums.ejs', {data: data});
    });
});
router.post('/Terrariums/:id', function (req, resp) {
    var userId = req.session.userId;
    if (userId == null) {
        resp.redirect("/login");
        return;
    }
    var Quantity = 1;
    var p = {Quantity:Quantity,Product_id: req.body.product_id, customer_id: customer};
    con.query('INSERT INTO cart_item SET ?', p, function (error, results) {
        if (error) {
            throw error;
        } else {
            resp.redirect('/Gardening/MiniatureGardens/Terrariums');
        }
    });
});
router.get('/Gardening/MiniatureGardens/GreenBeauty', (req, resp) => {
    var y = "SELECT products.product_id,products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=3"
    con.query(y, function (err, result, fields) {
        if (err) throw err;
        var data = result;
        resp.render('../views/Gardening/GreenBeauty.ejs', {data: data});

    })
});
router.post('/GreenBeauty/:id', function (req, resp) {
    var userId = req.session.userId;
    if (userId == null) {
        resp.redirect("/login");
        return;
    }
    var Quantity = 1;
    var p = {Quantity:Quantity,Product_id: req.body.product_id, customer_id: customer};
    con.query('INSERT INTO cart_item SET ?', p, function (error, results) {
        if (error) {
            throw error;
        } else {
            resp.redirect('/Gardening/MiniatureGardens/GreenBeauty');
        }
    });
});
//Gardening --> Plants By Features Sub Routes
router.get('/Gardening/PlantsByFeatures', (req, resp) => {
    var r = "SELECT products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=? LIMIT 3;SELECT products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=? LIMIT 3;SELECT products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=? LIMIT 3;SELECT products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=? LIMIT 3;"
    con.query(r, [4, 5, 6, 7], function (err, result, fields) {
        if (err) throw err;
        var data = result;
        resp.render('../views/Gardening/PlantsByFea.ejs', {data: data});
    });
})
router.get('/Gardening/PlantsByFeatures/AirPurifierPlants', (req, resp) => {
    var z = "SELECT products.product_id,products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=4"
    con.query(z, function (err, result, fields) {
        if (err) throw err;
        var data = result;
        resp.render('../views/Gardening/APPlants.ejs', {data: data});

    });
});
router.post('/AirPurifierPlants/:id', function (req, resp) {
    var userId = req.session.userId;
    if (userId == null) {
        resp.redirect("/login");
        return;
    }
    var Quantity = 1;
    var p = {Quantity:Quantity,Product_id: req.body.product_id, customer_id: customer};
    con.query('INSERT INTO cart_item SET ?', p, function (error, results) {
        if (error) {
            throw error;
        } else {
            resp.redirect('/Gardening/PlantsByFeatures/AirPurifierPlants');
        }
    });
});
router.get('/Gardening/PlantsByFeatures/IndoorPlants', (req, resp) => {
    var a = "SELECT products.product_id,products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=5"
    con.query(a, function (err, result, fields) {
        if (err) throw err;
        var data = result;
        resp.render('../views/Gardening/IndoorPlants.ejs', {data: data});
    });
})
router.post('/IndoorPlants/:id', function (req, resp) {
    var userId = req.session.userId;
    if (userId == null) {
        resp.redirect("/login");
        return;
    }
    var Quantity = 1;
    var p = {Quantity:Quantity,Product_id: req.body.product_id, customer_id: customer};
    con.query('INSERT INTO cart_item SET ?', p, function (error, results) {
        if (error) {
            throw error;
        } else {
            resp.redirect('/Gardening/PlantsByFeatures/IndoorPlants');
        }
    });
});
router.get('/Gardening/PlantsByFeatures/HangingPlants', (req, resp) => {
    var b = "SELECT products.product_id,products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=6"
    con.query(b, function (err, result, fields) {
        if (err) throw err;
        var data = result;
        resp.render('../views/Gardening/HangingPlants.ejs', {data: data});
    });
})
router.post('/HangingPlants/:id', function (req, resp) {
    var userId = req.session.userId;
    if (userId == null) {
        resp.redirect("/login");
        return;
    }
    var Quantity = 1;
    var p = {Quantity:Quantity,Product_id: req.body.product_id, customer_id: customer};
    con.query('INSERT INTO cart_item SET ?', p, function (error, results) {
        if (error) {
            throw error;
        } else {
            resp.redirect('/Gardening/PlantsByFeatures/HangingPlants');
        }
    });
});
router.get('/Gardening/PlantsByFeatures/CactusPlants', (req, resp) => {
    var c = "SELECT products.product_id,products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=7"
    con.query(c, function (err, result, fields) {
        if (err) throw err;
        var data = result;
        resp.render('../views/Gardening/CactusPlants.ejs', {data: data});
    });
})
router.post('/CactusPlants/:id', function (req, resp) {
    var userId = req.session.userId;
    if (userId == null) {
        resp.redirect("/login");
        return;
    }
    
    var Quantity = 1;
    var p = {Quantity:Quantity,Product_id: req.body.product_id, customer_id: customer};
    con.query('INSERT INTO cart_item SET ?', p, function (error, results) {
        if (error) {
            throw error;
        } else {
            resp.redirect('/Gardening/PlantsByFeatures/CactusPlants');
        }
    });
});
//Gardening --> Plants By Location Sub Routes
router.get('/Gardening/PlantsByLocation', (req, resp) => {
    var r = "SELECT products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=? LIMIT 3;SELECT products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=? LIMIT 3;SELECT products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=? ORDER BY products.price LIMIT 3 ;"
    con.query(r, [8, 9, 10], function (err, result, fields) {
        if (err) throw err;
        var data = result;
        resp.render('../views/Gardening/PlantsByLoc.ejs', {data: data});
    });
})
router.get('/Gardening/PlantsByLocation/VerticalGarden', (req, resp) => {
    var d = "SELECT products.product_id,products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=8"
    con.query(d, function (err, result, fields) {
        if (err) throw err;
        var data = result;
        resp.render('../views/Gardening/VerticalGarden.ejs', {data: data});
    });
})
router.post('/VerticalGarden/:id', function (req, resp) {
    var userId = req.session.userId;
    if (userId == null) {
        resp.redirect("/login");
        return;
    }
    
    var Quantity = 1;
    var p = {Quantity:Quantity,Product_id: req.body.product_id, customer_id: customer};
    con.query('INSERT INTO cart_item SET ?', p, function (error, results) {
        if (error) {
            throw error;
        } else {
            resp.redirect('/Gardening/PlantsByLocation/VerticalGarden');
        }
    });
});
router.get('/Gardening/PlantsByLocation/BalconyGarden', (req, resp) => {
    var e = "SELECT products.product_id,products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=9"
    con.query(e, function (err, result, fields) {
        if (err) throw err;
        var data = result;
        resp.render('../views/Gardening/BalconyGarden.ejs', {data: data});
    });
})
router.post('/BalconyGarden/:id', function (req, resp) {
    var userId = req.session.userId;
    if (userId == null) {
        resp.redirect("/login");
        return;
    }
    
    var Quantity = 1;
    var p = {Quantity:Quantity,Product_id: req.body.product_id, customer_id: customer};
    con.query('INSERT INTO cart_item SET ?', p, function (error, results) {
        if (error) {
            throw error;
        } else {
            resp.redirect('/Gardening/PlantsByLocation/BalconyGarden');
        }
    });
});
router.get('/Gardening/PlantsByLocation/TerraceGarden', (req, resp) => {
    var f = "SELECT products.product_id,products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=10"
    con.query(f, function (err, result, fields) {
        if (err) throw err;
        var data = result;
        resp.render('../views/Gardening/TerraceGarden.ejs', {data: data});
    });
})
router.post('/TerraceGarden/:id', function (req, resp) {
    var userId = req.session.userId;
    if (userId == null) {
        resp.redirect("/login");
        return;
    }
    
    var Quantity = 1;
    var p = {Quantity:Quantity,Product_id: req.body.product_id, customer_id: customer};
    con.query('INSERT INTO cart_item SET ?', p, function (error, results) {
        if (error) {
            throw error;
        } else {
            resp.redirect('/Gardening/PlantsByLocation/TerraceGarden');
        }
    });
});

//Gardening --> Plants By Seasons Sub Routes
router.get('/Gardening/PlantsBySeasons', (req, resp) => {
    var r = "SELECT products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=? LIMIT 3;SELECT products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=? LIMIT 3;SELECT products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=? LIMIT 3;"
    con.query(r, [11, 12, 13], function (err, result, fields) {
        if (err) throw err;
        var data = result;
        resp.render('../views/Gardening/PlantsBySea.ejs', {data: data});
    });
})
router.get('/Gardening/PlantsBySeasons/WinterPlants', (req, resp) => {
    var g = "SELECT products.product_id,products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=11"
    con.query(g, function (err, result, fields) {
        if (err) throw err;
        var data = result;
        resp.render('../views/Gardening/WinterPlants.ejs', {data: data});
    });
})
router.post('/WinterPlants/:id', function (req, resp) {
    var userId = req.session.userId;
    if (userId == null) {
        resp.redirect("/login");
        return;
    }
    
    var Quantity = 1;
    var p = {Quantity:Quantity,Product_id: req.body.product_id, customer_id: customer};
    con.query('INSERT INTO cart_item SET ?', p, function (error, results) {
        if (error) {
            throw error;
        } else {
            resp.redirect('/Gardening/PlantsBySeasons/WinterPlants');
        }
    });
});
router.get('/Gardening/PlantsBySeasons/MonsoonPlants', (req, resp) => {
    var h = "SELECT products.product_id,products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=13"
    con.query(h, function (err, result, fields) {
        if (err) throw err;
        var data = result;
        resp.render('../views/Gardening/MonsoonPlants.ejs', {data: data});
    });
})
router.post('/MonsoonPlants/:id', function (req, resp) {
    var userId = req.session.userId;
    if (userId == null) {
        resp.redirect("/login");
        return;
    }
    
    var Quantity = 1;
    var p = {Quantity:Quantity,Product_id: req.body.product_id, customer_id: customer};
    con.query('INSERT INTO cart_item SET ?', p, function (error, results) {
        if (error) {
            throw error;
        } else {
            resp.redirect('/Gardening/PlantsBySeasons/MonsoonPlants');
        }
    });
});
router.get('/Gardening/PlantsBySeasons/SummerPlants', (req, resp) => {
    var i = "SELECT products.product_id,products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=12"
    con.query(i, function (err, result, fields) {
        if (err) throw err;
        var data = result;
        resp.render('../views/Gardening/SummerPlants.ejs', {data: data});
    });
})
router.post('/SummerPlants/:id', function (req, resp) {
    var userId = req.session.userId;
    if (userId == null) {
        resp.redirect("/login");
        return;
    }
    
    var Quantity = 1;
    var p = {Quantity:Quantity,Product_id: req.body.product_id, customer_id: customer};
    con.query('INSERT INTO cart_item SET ?', p, function (error, results) {
        if (error) {
            throw error;
        } else {
            resp.redirect('/Gardening/PlantsBySeasons/SummerPlants');
        }
    });
});

//-------------------------------------------------------------------------//
router.get('/Plants', (req, resp) => {
    resp.render('../views/Plants/Plants.ejs');
})
//Plants --> Plants By Type Sub Routes//
router.get('/Plants/PlantsByType', (req, resp) => {
    var z = "SELECT products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=? LIMIT 3;SELECT products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=? LIMIT 3;SELECT products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=? LIMIT 3;SELECT products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=? LIMIT 3;SELECT products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=? LIMIT 3;SELECT products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=? LIMIT 3;"
    con.query(z, [14, 15, 16, 17, 18, 19], function (err, result, fields) {
        if (err) throw err;
        var data = result;
        resp.render('../views/Plants/PlantsByType.ejs', {data: data});
    });
})
router.get('/Plants/PlantsByType/AvenueTrees', (req, resp) => {
    var j = "SELECT products.product_id,products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=14"
    con.query(j, function (err, result, fields) {
        if (err) throw err;
        var data = result;
        resp.render('../views/Plants/AvenueTrees.ejs', {data: data});
    });
})
router.post('/AvenueTrees/:id', function (req, resp) {
    var userId = req.session.userId;
    if (userId == null) {
        resp.redirect("/login");
        return;
    }
    
    var Quantity = 1;
    var p = {Quantity:Quantity,Product_id: req.body.product_id, customer_id: customer};
    con.query('INSERT INTO cart_item SET ?', p, function (error, results) {
        if (error) {
            throw error;
        } else {
            resp.redirect('/Plants/PlantsByType/AvenueTrees');
        }
    });
});
router.get('/Plants/PlantsByType/BonsaiPlants', (req, resp) => {
    var k = "SELECT products.product_id,products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=15"
    con.query(k, function (err, result, fields) {
        if (err) throw err;
        var data = result;
        resp.render('../views/Plants/BonsaiPlants.ejs', {data: data});
    });
})
router.post('/BonsaiPlants/:id', function (req, resp) {
    var userId = req.session.userId;
    if (userId == null) {
        resp.redirect("/login");
        return;
    }
    
    var Quantity = 1;
    var p = {Quantity:Quantity,Product_id: req.body.product_id, customer_id: customer};
    con.query('INSERT INTO cart_item SET ?', p, function (error, results) {
        if (error) {
            throw error;
        } else {
            resp.redirect('/Plants/PlantsByType/BonsaiPlants');
        }
    });
});
router.get('/Plants/PlantsByType/ClimbersAndCreepers', (req, resp) => {
    var l = "SELECT products.product_id,products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=16"
    con.query(l, function (err, result, fields) {
        if (err) throw err;
        var data = result;
        resp.render('../views/Plants/ClimbersAndCreepers.ejs', {data: data});
    });
})
router.post('/ClimbersAndCreepers/:id', function (req, resp) {
    var userId = req.session.userId;
    if (userId == null) {
        resp.redirect("/login");
        return;
    }
    
    var Quantity = 1;
    var p = {Quantity:Quantity,Product_id: req.body.product_id, customer_id: customer};
    con.query('INSERT INTO cart_item SET ?', p, function (error, results) {
        if (error) {
            throw error;
        } else {
            resp.redirect('/Plants/PlantsByType/ClimbersAndCreepers');
        }
    });
});
router.get('/Plants/PlantsByType/Ferns', (req, resp) => {
    var m = "SELECT products.product_id,products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=17"
    con.query(m, function (err, result, fields) {
        if (err) throw err;
        var data = result;
        resp.render('../views/Plants/Ferns.ejs', {data: data});
    });
})
router.post('/Ferns/:id', function (req, resp) {
    var userId = req.session.userId;
    if (userId == null) {
        resp.redirect("/login");
        return;
    }
    
    var Quantity = 1;
    var p = {Quantity:Quantity,Product_id: req.body.product_id, customer_id: customer};
    con.query('INSERT INTO cart_item SET ?', p, function (error, results) {
        if (error) {
            throw error;
        } else {
            resp.redirect('/Plants/PlantsByType/Ferns');
        }
    });
});
router.get('/Plants/PlantsByType/FruitPlants', (req, resp) => {
    var n = "SELECT products.product_id,products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=18"
    con.query(n, function (err, result, fields) {
        if (err) throw err;
        var data = result;
        resp.render('../views/Plants/FruitPlants.ejs', {data: data});
    });
})
router.post('/FruitPlants/:id', function (req, resp) {
    var userId = req.session.userId;
    if (userId == null) {
        resp.redirect("/login");
        return;
    }
    
    var Quantity = 1;
    var p = {Quantity:Quantity,Product_id: req.body.product_id, customer_id: customer};
    con.query('INSERT INTO cart_item SET ?', p, function (error, results) {
        if (error) {
            throw error;
        } else {
            resp.redirect('/Plants/PlantsByType/FruitPlants');
        }
    });
});
router.get('/Plants/PlantsByType/FicusAndFig', (req, resp) => {
    var o = "SELECT products.product_id,products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=19"
    con.query(o, function (err, result, fields) {
        if (err) throw err;
        var data = result;
        resp.render('../views/Plants/FicusAndFig.ejs', {data: data});
    });
})
router.post('/FicusAndFig/:id', function (req, resp) {
    var userId = req.session.userId;
    if (userId == null) {
        resp.redirect("/login");
        return;
    }
    
    var Quantity = 1;
    var p = {Quantity:Quantity,Product_id: req.body.product_id, customer_id: customer};
    con.query('INSERT INTO cart_item SET ?', p, function (error, results) {
        if (error) {
            throw error;
        } else {
            resp.redirect('/Plants/PlantsByType/FicusAndFig');
        }
    });
});

//Plants --> Flowering Plants Sub Routes
router.get('/Plants/FloweringPlants', (req, resp) => {
    var z = "SELECT products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=? LIMIT 3;SELECT products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=? LIMIT 3;SELECT products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=? LIMIT 3;SELECT products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=? LIMIT 3;SELECT products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=? LIMIT 3;SELECT products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=? LIMIT 3;"
    con.query(z, [20, 21, 22, 23, 24, 25], function (err, result, fields) {
        if (err) throw err;
        var data = result;
        resp.render('../views/Plants/FloweringPlants.ejs', {data: data});
    });
})
router.get('/Plants/FloweringPlants/RosePlants', (req, resp) => {
    var o = "SELECT products.product_id,products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=20"
    con.query(o, function (err, result, fields) {
        if (err) throw err;
        var data = result;
        resp.render('../views/Plants/RosePlants.ejs', {data: data});
    });
})
router.post('/RosePlants/:id', function (req, resp) {
    var userId = req.session.userId;
    if (userId == null) {
        resp.redirect("/login");
        return;
    }
    
    var Quantity = 1;
    var p = {Quantity:Quantity,Product_id: req.body.product_id, customer_id: customer};
    con.query('INSERT INTO cart_item SET ?', p, function (error, results) {
        if (error) {
            throw error;
        } else {
            resp.redirect('/Plants/FloweringPlants/RosePlants');
        }
    });
});
router.get('/Plants/FloweringPlants/JasminePlants', (req, resp) => {
    var o = "SELECT products.product_id,products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=21"
    con.query(o, function (err, result, fields) {
        if (err) throw err;
        var data = result;
        resp.render('../views/Plants/JasminePlants.ejs', {data: data});
    });
})
router.post('/JasminePlants/:id', function (req, resp) {
    var userId = req.session.userId;
    if (userId == null) {
        resp.redirect("/login");
        return;
    }
    
    var Quantity = 1;
    var p = {Quantity:Quantity,Product_id: req.body.product_id, customer_id: customer};
    con.query('INSERT INTO cart_item SET ?', p, function (error, results) {
        if (error) {
            throw error;
        } else {
            resp.redirect('/Plants/FloweringPlants/JasminePlants');
        }
    });
});
router.get('/Plants/FloweringPlants/HibiscusPlants', (req, resp) => {
    var p = "SELECT products.product_id,products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=22"
    con.query(p, function (err, result, fields) {
        if (err) throw err;
        var data = result;
        resp.render('../views/Plants/HibiscusPlants.ejs', {data: data});
    });
})
router.post('/HibiscusPlants/:id', function (req, resp) {
    var userId = req.session.userId;
    if (userId == null) {
        resp.redirect("/login");
        return;
    }
    
    var Quantity = 1;
    var p = {Quantity:Quantity,Product_id: req.body.product_id, customer_id: customer};
    con.query('INSERT INTO cart_item SET ?', p, function (error, results) {
        if (error) {
            throw error;
        } else {
            resp.redirect('/Plants/FloweringPlants/HibiscusPlants');
        }
    });
});
router.get('/Plants/FloweringPlants/BougainvilleaPlants', (req, resp) => {
    var p = "SELECT products.product_id,products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=23"
    con.query(p, function (err, result, fields) {
        if (err) throw err;
        var data = result;
        resp.render('../views/Plants/BougainvilleaPlants.ejs', {data: data});
    });
})
router.post('/BougainvilleaPlants/:id', function (req, resp) {
    var userId = req.session.userId;
    if (userId == null) {
        resp.redirect("/login");
        return;
    }
    
    var Quantity = 1;
    var p = {Quantity:Quantity,Product_id: req.body.product_id, customer_id: customer};
    con.query('INSERT INTO cart_item SET ?', p, function (error, results) {
        if (error) {
            throw error;
        } else {
            resp.redirect('/Plants/FloweringPlants/BougainvilleaPlants');
        }
    });
});
router.get('/Plants/FloweringPlants/FloweringCreepers', (req, resp) => {
    var p = "SELECT products.product_id,products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=24"
    con.query(p, function (err, result, fields) {
        if (err) throw err;
        var data = result;
        resp.render('../views/Plants/FloweringCreepers.ejs', {data: data});
    });
})
router.post('/FloweringCreepers/:id', function (req, resp) {
    var userId = req.session.userId;
    if (userId == null) {
        resp.redirect("/login");
        return;
    }
    
    var Quantity = 1;
    var p = {Quantity:Quantity,Product_id: req.body.product_id, customer_id: customer};
    con.query('INSERT INTO cart_item SET ?', p, function (error, results) {
        if (error) {
            throw error;
        } else {
            resp.redirect('/Plants/FloweringPlants/FloweringCreepers');
        }
    });
});
router.get('/Plants/FloweringPlants/FloweringTrees', (req, resp) => {
    var p = "SELECT products.product_id,products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=25"
    con.query(p, function (err, result, fields) {
        if (err) throw err;
        var data = result;
        resp.render('../views/Plants/FloweringTrees.ejs', {data: data});
    });
})
router.post('/FloweringTrees/:id', function (req, resp) {
    var userId = req.session.userId;
    if (userId == null) {
        resp.redirect("/login");
        return;
    }
    
    var Quantity = 1;
    var p = {Quantity:Quantity,Product_id: req.body.product_id, customer_id: customer};
    con.query('INSERT INTO cart_item SET ?', p, function (error, results) {
        if (error) {
            throw error;
        } else {
            resp.redirect('/Plants/FloweringPlants/FloweringTrees');
        }
    });
});
//Plants Foliage Plants Sub Routes
router.get('/Plants/FoliagePlants', (req, resp) => {
    var z = "SELECT products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=? LIMIT 3;SELECT products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=? LIMIT 3;SELECT products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=? LIMIT 3;SELECT products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=? LIMIT 3;SELECT products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=? LIMIT 3;"
    con.query(z, [26, 27, 28, 29, 30], function (err, result, fields) {
        if (err) throw err;
        var data = result;
        resp.render('../views/Plants/FoliagePlants.ejs', {data: data});
    });
})
router.get('/Plants/FoliagePlants/MoneyPlants', (req, resp) => {
    var p = "SELECT products.product_id,products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=26"
    con.query(p, function (err, result, fields) {
        if (err) throw err;
        var data = result;
        resp.render('../views/Plants/MoneyPlants.ejs', {data: data});
    });
})
router.post('/MoneyPlants/:id', function (req, resp) {
    var userId = req.session.userId;
    if (userId == null) {
        resp.redirect("/login");
        return;
    }
    
    var Quantity = 1;
    var p = {Quantity:Quantity,Product_id: req.body.product_id, customer_id: customer};
    con.query('INSERT INTO cart_item SET ?', p, function (error, results) {
        if (error) {
            throw error;
        } else {
            resp.redirect('/Plants/FoliagePlants/MoneyPlants');
        }
    });
});
router.get('/Plants/FoliagePlants/JadePlants', (req, resp) => {
    var p = "SELECT products.product_id,products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=27"
    con.query(p, function (err, result, fields) {
        if (err) throw err;
        var data = result;
        resp.render('../views/Plants/JadePlants.ejs', {data: data});
    });
})
router.post('/JadePlants/:id', function (req, resp) {
    var userId = req.session.userId;
    if (userId == null) {
        resp.redirect("/login");
        return;
    }
    
    var Quantity = 1;
    var p = {Quantity:Quantity,Product_id: req.body.product_id, customer_id: customer};
    con.query('INSERT INTO cart_item SET ?', p, function (error, results) {
        if (error) {
            throw error;
        } else {
            resp.redirect('/Plants/FoliagePlants/JadePlants');
        }
    });
});
router.get('/Plants/FoliagePlants/DracaenaPlants', (req, resp) => {
    var p = "SELECT products.product_id,products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=28"
    con.query(p, function (err, result, fields) {
        if (err) throw err;
        var data = result;
        resp.render('../views/Plants/DracaenaPlants.ejs', {data: data});
    });
})
router.post('/DracaenaPlants/:id', function (req, resp) {
    var userId = req.session.userId;
    if (userId == null) {
        resp.redirect("/login");
        return;
    }
    
    var Quantity = 1;
    var p = {Quantity:Quantity,Product_id: req.body.product_id, customer_id: customer};
    con.query('INSERT INTO cart_item SET ?', p, function (error, results) {
        if (error) {
            throw error;
        } else {
            resp.redirect('/Plants/FoliagePlants/DracaenaPlants');
        }
    });
});
router.get('/Plants/FoliagePlants/CrotonPlants', (req, resp) => {
    var p = "SELECT products.product_id,products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=29"
    con.query(p, function (err, result, fields) {
        if (err) throw err;
        var data = result;
        resp.render('../views/Plants/CrotonPlants.ejs', {data: data});
    });
})
router.post('/CrotonPlants/:id', function (req, resp) {
    var userId = req.session.userId;
    if (userId == null) {
        resp.redirect("/login");
        return;
    }
    
    var Quantity = 1;
    var p = {Quantity:Quantity,Product_id: req.body.product_id, customer_id: customer};
    con.query('INSERT INTO cart_item SET ?', p, function (error, results) {
        if (error) {
            throw error;
        } else {
            resp.redirect('/Plants/FoliagePlants/CrotonPlants');
        }
    });
});
router.get('/Plants/FoliagePlants/AraliaPlants', (req, resp) => {
    var p = "SELECT products.product_id,products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=30"
    con.query(p, function (err, result, fields) {
        if (err) throw err;
        var data = result;
        resp.render('../views/Plants/AraliaPlants.ejs', {data: data});
    });
})
router.post('/AraliaPlants/:id', function (req, resp) {
    var userId = req.session.userId;
    if (userId == null) {
        resp.redirect("/login");
        return;
    }
    
    var Quantity = 1;
    var p = {Quantity:Quantity,Product_id: req.body.product_id, customer_id: customer};
    con.query('INSERT INTO cart_item SET ?', p, function (error, results) {
        if (error) {
            throw error;
        } else {
            resp.redirect('/Plants/FoliagePlants/AraliaPlants');
        }
    });
});
//Plants Plants By Uses Sub Routes
router.get('/Plants/PlantsByUses', (req, resp) => {
    var r = "SELECT products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=? LIMIT 3;SELECT products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=? LIMIT 3;SELECT products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=? LIMIT 3;"
    con.query(r, [31, 32, 33], function (err, result, fields) {
        if (err) throw err;
        var data = result;
        resp.render('../views/Plants/PlantsByUses.ejs', {data: data});
    });
})
router.get('/Plants/PlantsByUses/MedicinalPlants', (req, resp) => {
    var p = "SELECT products.product_id,products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=31"
    con.query(p, function (err, result, fields) {
        if (err) throw err;
        var data = result;
        resp.render('../views/Plants/MedicinalPlants.ejs', {data: data});
    });
})
router.post('/MedicinalPlants/:id', function (req, resp) {
    var userId = req.session.userId;
    if (userId == null) {
        resp.redirect("/login");
        return;
    }
    
    var Quantity = 1;
    var p = {Quantity:Quantity,Product_id: req.body.product_id, customer_id: customer};
    con.query('INSERT INTO cart_item SET ?', p, function (error, results) {
        if (error) {
            throw error;
        } else {
            resp.redirect('/Plants/PlantsByUses/MedicinalPlants');
        }
    });
});
router.get('/Plants/PlantsByUses/AromaticPlants', (req, resp) => {
    var p = "SELECT products.product_id,products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=33"
    con.query(p, function (err, result, fields) {
        if (err) throw err;
        var data = result;
        resp.render('../views/Plants/AromaticPlants.ejs', {data: data});
    });
})
router.post('/AromaticPlants/:id', function (req, resp) {
    var userId = req.session.userId;
    if (userId == null) {
        resp.redirect("/login");
        return;
    }
    
    var Quantity = 1;
    var p = {Quantity:Quantity,Product_id: req.body.product_id, customer_id: customer};
    con.query('INSERT INTO cart_item SET ?', p, function (error, results) {
        if (error) {
            throw error;
        } else {
            resp.redirect('/Plants/PlantsByUses/AromaticPlants');
        }
    });
});
router.get('/Plants/PlantsByUses/InsectRepellentPlants', (req, resp) => {
    var p = "SELECT products.product_id,products.product_name,products.Prod_image,products.price,products.review,category.Category_name FROM products JOIN category ON products.Category_Id=category.Category_Id WHERE products.Category_Id=32"
    con.query(p, function (err, result, fields) {
        if (err) throw err;
        var data = result;
        resp.render('../views/Plants/InsectRepellentPlants.ejs', {data: data});
    });
})
router.post('/InsectRepellentPlants/:id', function (req, resp) {
    var userId = req.session.userId;
    if (userId == null) {
        resp.redirect("/login");
        return;
    }
    
    var Quantity = 1;
    var p = {Quantity:Quantity,Product_id: req.body.product_id, customer_id: customer};
    con.query('INSERT INTO cart_item SET ?', p, function (error, results) {
        if (error) {
            throw error;
        } else {
            resp.redirect('/Plants/PlantsByUses/InsectRepellentPlants');
        }
    });
});


//-----------------------------------------------------------------------------//
router.get('/Seeds', (req, resp) => {
    resp.render('../views/Seeds/Seeds.ejs');
})
router.get('/Seeds/HerbSeeds', (req, resp) => {
    resp.render('../views/Seeds/HerbSeeds.ejs');
})
router.get('/Seeds/FloweringSeeds', (req, resp) => {
    resp.render('../views/Seeds/FloweringSeeds.ejs');
})
router.get('/Seeds/ForestrySeeds', (req, resp) => {
    resp.render('../views/Seeds/ForestrySeeds.ejs');
})

//Other Seeds  Sub Routes
router.get('/Seeds/OtherSeeds', (req, resp) => {
    resp.render('../views/Seeds/OtherSeeds.ejs');
})
router.get('/Seeds/OtherSeeds/FruitSeeds', (req, resp) => {
    resp.render('../views/Seeds/FruitSeeds.ejs');
})
router.get('/Seeds/OtherSeeds/GrassSeeds', (req, resp) => {
    resp.render('../views/Seeds/GrassSeeds.ejs');
})


//--------------------------------------------------------------------------//
//Soil And Fertilizer Routes
router.get('/SoilAndFertilizer', (req, resp) => {
    resp.render('../views/SoilAndFertilizer/SoilAndFertilizer.ejs');
})
router.get('/SoilAndFertilizer/PottingSoilMixes', (req, resp) => {
    resp.render('../views/SoilAndFertilizer/PottingSoilMixes.ejs');
})
router.get('/SoilAndFertilizer/Fertilizer', (req, resp) => {
    resp.render('../views/SoilAndFertilizer/Fertilizer.ejs');
})
router.get('/SoilAndFertilizer/SoilAmendments', (req, resp) => {
    resp.render('../views/SoilAndFertilizer/SoilAmendments.ejs');
})
router.get('/SoilAndFertilizer/SeedStartingSoils', (req, resp) => {
    resp.render('../views/SoilAndFertilizer/SeedStartingSoils.ejs');
})


//-----------------------------------------------------------------------------//

router.get('/PestsADC', (req, resp) => {
    resp.render('../views/PestsADC/PestsADC.ejs');
});
router.get('/Accessories', (req, resp) => {
    resp.render('../views/Accessories/Accessories.ejs');
});

//-----------------------------------------------------------------------------//
router.get('/Cart', (req, resp) => {
    var userId = req.session.userId;
    if (userId == null) {
        resp.redirect("/login");
        return;
    }
    var a = "SELECT * FROM cart_item JOIN products ON cart_item.Product_id=products.Product_id ORDER BY products.price"
    con.query(a, function (err, result, fields) {
        if (err) throw err;
        var data = result;
        console.log(data)
        resp.render('../views/cart.ejs', {data: data, customer: customer})
    });
})
//route for deleting items from the cart
router.post('/Cart/:id', (req, resp) => {
    var Cart_Id = req.params.id;
    sql_query = "DELETE FROM cart_item WHERE Cart_Id = ?";
    con.query(sql_query, [Cart_Id], function (err, result) {
        if (err) {
            console.log(err);
        } else {
            console.log(result);
            resp.redirect('/Cart');
        }
    })
    
})
//routes for increasing quantity of each item
router.post('/Cart_Item/:id', (req, resp) => {
    var item_no = req.params.id;
    var quantity = req.body.quantity;
    sql_query1 = 'UPDATE cart_item SET Quantity = ? WHERE Cart_Id =?';
    con.query(sql_query1, [quantity, item_no], function (err, result) {
        if (err) {
            console.log(err)
        } else {
            console.log(result);
            resp.redirect('/Cart')
        }
    })
})

var randomnum = Math.floor((Math.random() * 1000) + 1);
//saved card details ROUTES
router.get('/home/SavedCards', (req, resp) => {
    var userId = req.session.userId;
    if (userId == null) {
        resp.redirect("/login");
        return;
    }
    var sql = "SELECT * FROM card_details JOIN customers ON card_details.customer_id=customers.customer_id WHERE card_details.customer_id=?";

    con.query(sql, [customer], function (err, result) {
        console.log(result)
        resp.render('SavedCards', {data: result,randomnum:randomnum});
    });
})
router.post('/home/SavedCards/NewCard/:id', (req, resp) => {
    var userId = req.session.userId;
    if (userId == null) {
        resp.redirect("/login");
        return;
    }
    var id = req.params.id;
    var cardtype = req.body.cardtype;
    var cardholdername = req.body.cardholdername;
    var cardnumber = req.body.cardnumber;
    var expirydate = req.body.expirydate;
    var cvv = req.body.cvv;
    
    var sql_ques = `INSERT INTO card_details(cardtype,cardholdername,cardnumber,expirydate,cvv,customer_id) VALUES (?,?,?,?,?,?)`;
    con.query(sql_ques, [cardtype, cardholdername, cardnumber, expirydate, cvv, customer], function (err, results) {
        if (err) {
            console.log(err);
        } else {
            resp.redirect('/home/SavedCards')
        }
    })
    
})
module.exports = router;