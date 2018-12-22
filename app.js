const dominos = require('dominos'); // Prod
//const dominos = require('pizzapi'); // test
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
		Customer: joi.object().keys({
			address: joi.object().keys({
				Street: joi.string().trim().required(),
				Region: joi.string().trim().required().length(2),
				City: joi.string().trim().required(),
				PostalCode: joi.string().trim().required().length(5)
			}),
			firstName: joi.string().trim().required(),
			lastName: joi.string().trim().required(),
			email: joi.string().trim().email().required(),
			phone: joi.string().trim().regex(/^\d{10}$/).required()
		}),
		cardInfo: joi.object().keys({
			Number: joi.string().trim().creditCard().required(),
			SecurityCode: joi.string().trim().required().length(3),
			PostalCode: joi.string().trim().required().length(5),
			Expiration: joi.string().trim().required().length(4)
		})
	});

	joi.validate(req.body, schema, (err, value) => {
		if (err) {
			res.send(err);
		}
		else {
			// order some dominos
			let customer = new dominos.Customer(value.Customer);
			let order = new dominos.Order({customer: customer, storeID: value.storeId, deliveryMethod: 'Delivery'});

			value.orderItems.forEach((val) => {
				order.addItem(new dominos.Item({code: val, options: [], quantity: 1}));
			});

			order.validate((response1) => {
				if (response1.success) {
					order.price((response2) => {
						
						let cardInfo = new order.PaymentObject();
						cardInfo.Amount = order.Amounts.Customer;
						cardInfo.Number = value.cardInfo.Number;
						cardInfo.CardType = order.validateCC(value.cardInfo.Number);
						cardInfo.Expiration = value.cardInfo.Expiration;
						cardInfo.SecurityCode = value.cardInfo.SecurityCode;
						cardInfo.PostalCode = value.cardInfo.PostalCode;
						order.Payments.push(cardInfo);

						order.place((response3) => {
							console.log("Ordered!");
							res.send({success: "Successfully Ordered!"});
						});

					});
				}
				else {
					console.log("Invalid Order!");
					res.send({error: "Invalid Order!"});
				}
			});

		}
	});

	
});


app.listen(process.env.PORT || 3000);