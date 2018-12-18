//const dominos = require('dominos'); // Prod
const dominos = require('pizzapi'); // test
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const joi = require('joi');
const app = express();

app.use('/public', express.static(path.join(__dirname, 'static')));
app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());
//app.set('view engine', 'ejs'); // opted for Vue instead

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

app.post('/Stores', (req, res) => {
	dominos.Util.findNearbyStores(
		req.body.address,
		'Delivery',
		(data) => {
			if (data.success) {
				res.send(data.result.Stores);
			}
			else {
				res.send([]);
			}
		}
	);
});

app.post('/Menu', (req, res) => {
	const store = new dominos.Store({ID: req.body.storeId });
	store.getFriendlyNames(
		(data) => {
			if (data.success) {
				let newArray = data.result.map((val) => {
					for (let k in val) {
						if (typeof val[k] === "object") { // test api returns different format
							return {
								"code": k,
								"name": val[k].Name
							};
						}
						else {
							return {
								"code": val[k],
								"name": k
							};
						}
					};
				});
				res.send(newArray);
			}
			else {
				res.send([]);
			}
		}
	);
});

app.post('/Order', (req, res) => {
	const schema = joi.object().keys({
		storeId: joi.string().trim().required(),
		orderItems: joi.array().min(1),
		street: joi.string().trim().required(),
		region: joi.string().trim().required().length(2),
		city: joi.string().trim().required(),
		postalCode: joi.string().trim().required().length(5),
		firstName: joi.string().trim().required(),
		lastName: joi.string().trim().required(),
		email: joi.string().trim().email().required(),
		phone: joi.string().trim().regex(/\d{3}-\d{3}-\d{4}/).required(),
		creditCardNumber: joi.string().trim().creditCard().required(),
		securityCode: joi.string().trim().required().length(3),
		billingZip: joi.string().trim().required().length(5),
		expirationDate: joi.string().trim().required().length(4),
	});

	joi.validate(req.body, schema, (err, value) => {
		if (err) {
			res.send(err);
		}
		else {
			// order some dominos
			let address = new dominos.Address({Street: value.street, City: value.city, Region: value.region, PostalCode: value.postalCode});
			let customer = new dominos.Customer({address: address, firstName: value.firstName, lastName: value.lastName, phone: value.phone, email: value.email});
			let order = new dominos.Order({customer: customer, storeID: value.storeId, deliveryMethod: 'Delivery'});

			value.orderItems.forEach((val) => {
				order.addItem(new dominos.Item({code: val, options: [], quantity: 1}));
			});

			order.validate((result) => {
				if (result.success) {
					console.log("Valid Order!");
					//res.send({success: "Successfully Ordered!"});

				}
				else {
					console.log("Invalid Order!");
					//res.send({error: "Invalid Order!"});

				}
			});

			/*order.place(function (response) {
				console.log(response);
			});*/

			/*order.price((res) => {
				//console.log(res);
				console.log(res.result.Order.Amounts);
				console.log(res.result.Order.AmountsBreakdown);
			});*/


			//res.send({success: "Successfully ordered!"});
		}
	});

	
});


app.listen(3000);