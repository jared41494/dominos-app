// intro text component
Vue.component('intro', {
	template: `
	<div id="intro">
		<h1 class="text-center">{{ title }}</h1>
		<p>
			Welcome to my Dominos Online Ordering application! This application utilizes NodeJS and a Dominos API on the backend and Vue.js and Bootstrap on the frontend to allow people to order some dominos quickly. 
		</p>
		<p>
			Currently, the application is in development mode; in other words, your order will be validated but will NOT go to Dominos for an order.
		</p>
	</div>
`,
	data() {
		return {
			title: "Order Some Dominos!"
		}
	}
});

// customer information form 
Vue.component('customer-info-form', {
	props: {
		orderitems: {
			type: Array
		},
		store: {
			type: String,
			default: ""
		}
	},
	template: `
	<form name="placeOrder" id="placeOrder" method="post" action="/" @submit="SubmitOrder" v-if="store && orderitems.length > 0" novalidate="true">
		<div class="row" v-if="formErrors.length > 0">
			<div class="col">
				<p class="text-danger">
					<span v-for="error in formErrors">{{ error }}</span>
				</p>
			</div>
		</div>
		<div class="row">
			<div class="col">
				<h2>Address Information</h2>
				<div class="form-group">
					<label for="street">Street Address</label>
					<input class="form-control" type="text" name="street" v-model="street" required="required" maxlength="150" placeholder="1200 Fake Lane" />
				</div>
				<div class="form-group">
					<label for="city">City</label>
					<input class="form-control" type="text" name="city" v-model="city" required="required" maxlength="75" placeholder="Fake" />
				</div>
				<div class="form-group">
					<label for="region">State</label>
					<input class="form-control" type="text" name="region" v-model="region" required="required" maxlength="2" placeholder="AA" />
				</div>
				<div class="form-group">
					<label for="postalCode">Zip</label>
					<input class="form-control" type="text" name="postalCode" v-model="postalCode" required="required" maxlength="5" placeholder="55555" />
				</div>
			</div>
			<div class="col">
				<h2>Customer Information</h2>
				<div class="form-group">
					<label for="firstName">First Name</label>
					<input class="form-control" type="text" name="firstName" v-model="firstName" required="required" maxlength="75" placeholder="John" />
				</div>
				<div class="form-group">
					<label for="lastName">Last Name</label>
					<input class="form-control" type="text" name="lastName" v-model="lastName" required="required" maxlength="150" placeholder="Smith" />
				</div>
				<div class="form-group">
					<label for="phone">Phone</label>
					<input class="form-control" type="phone" name="phone" v-model="phone" required="required" maxlength="12" placeholder="555-555-5555" />
				</div>
				<div class="form-group">
					<label for="email">Email</label>
					<input class="form-control" type="email" name="email" v-model="email" required="required" maxlength="75" placeholder="john@smith.com" />
				</div>
			</div>
			<div class="col">
				<h2>Credit Card Information</h2>
				<div class="form-group">
					<label for="creditCardNumber">Card Number</label>
					<input class="form-control" type="text" name="creditCardNumber" v-model="creditCardNumber" required="required" maxlength="16" placeholder="0000000000000000" />
				</div>
				<div class="form-group">
					<label for="expirationDate">Expiration Date</label>
					<input class="form-control" type="text" name="expirationDate" v-model="expirationDate" required="required" maxlength="4" placeholder="1111" />
				</div>
				<div class="form-group">
					<label for="securityCode">Secuirty Code</label>
					<input class="form-control" type="text" name="securityCode" v-model="securityCode" required="required" maxlength="3" placeholder="000" />
				</div>
				<div class="form-group">
					<label for="billingZip">Billing Zip</label>
					<input class="form-control" type="text" name="billingZip" v-model="billingZip" required="required" maxlength="5" placeholder="55555" />
				</div>
			</div>
		</div>
		<div class="row">
			<div class="col-12">
				<input class="btn btn-primary" type="submit" value="Place Order" />
			</div>
		</div>
	</form>
`,
	data() {
		return {
			formErrors: [],
			street: "",
			city: "",
			postalCode: "",
			region: "",
			firstName: "",
			lastName: "",
			phone: "",
			email: "",
			creditCardNumber: "",
			expirationDate: "",
			securityCode: "",
			billingZip: ""
		}
	},
	watch: {
		postalCode(newVal) { this.postalCode = this.NumbersOnly(newVal); },
		creditCardNumber(newVal) { this.creditCardNumber = this.NumbersOnly(newVal); },
		expirationDate(newVal) { this.expirationDate = this.NumbersOnly(newVal); },
		securityCode(newVal) { this.securityCode = this.NumbersOnly(newVal); },
		billingZip(newVal) { this.billingZip = this.NumbersOnly(newVal); },
		region(newVal) { this.region = newVal.toUpperCase(); },
		phone(newVal, oldVal) {
			let newValLen = newVal.length;
			let char = newVal.slice(newValLen - 1, newValLen);

			if (newValLen > oldVal.length) {
				if (char.match(/[0-9]/g)) {
					if (newValLen === 4 || newValLen === 8) {
						this.phone = newVal.slice(0, newValLen - 1) + "-" + char;
					}
				}
				else {
					this.phone = oldVal;
				}
			}
		}
	},
	methods: {
		NumbersOnly(value) {
			return value.replace(/[^0-9]/g, '');
		},
		CheckOrder() {
			this.formErrors = [];

			if (!this.email.match(/\w+@\w+\.\w{3,4}/gi)) { this.formErrors.push("Email is invalid!\n"); }

			if (!this.phone.match(/\d{3}-\d{3}-\d{4}/gi)) { this.formErrors.push("Phone is invalid!\n"); }

			if (this.formErrors.length > 0) { return false; } 

			return true;
		},
		SubmitOrder(e) {
			e.preventDefault();
			if (this.CheckOrder()) {
				axios.post('/Order', {
					storeId: this.storeId,
					orderItems: this.orderItems,
					street: this.street,
					region: this.region,
					city: this.city,
					postalCode: this.postalCode,
					firstName: this.firstName,
					lastName: this.lastName,
					phone: this.phone,
					email: this.email,
					creditCardNumber: this.creditCardNumber,
					expirationDate: this.expirationDate,
					securityCode: this.securityCode,
					billingZip: this.billingZip
				}).then((res) => {
					console.log(res);
					if (res.data.hasOwnProperty("isJoi")) {
						alert(res.data.details["message"]);
					}
					else {
						// successful order

					}
					
				}).catch((err) => {
					console.log(err);
				});
			}

			return false;
		}
	}
});

// store menu component
Vue.component('store-menu', {
	template: `
	<div class="store-menu">
		<div id="menuModal" class="modal modal-centered fade" tabindex="-1" role="dialog">
			<div class="modal-dialog modal-lg" role="document">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title">Menu</h5>
						<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
					</div>
					<div class="modal-body">
						<div class="row" v-if="orderItems.length > 0">
							<div class="col">
								<h3>Your Order</h3>
								<div class="form-group form-check" v-for="item in displayOrderItems">
									<input type="checkbox" name="orderItems[]" v-model="orderItems" :value="item.code" @change="OrderChange" />
									<label class="form-check-label">{{ item.code }} - {{ item.name }}</label>
								</div>
							</div>
						</div>
						<div class="row">
							<div class="col">
								<h3>Filter</h3>
								<input class="form-control" type="text" v-model="searchFilter" />
							</div>
						</div>
						<table class="table">
							<thead>
								<tr>
									<th></th>
									<th>Code</th>
									<th>Name</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="item in filteredMenuItems">
									<td><input type="checkbox" name="orderItems[]" v-model="orderItems" :value="item.code" @change="OrderChange" /></td>
									<td>{{ item.code }}</td>
									<td>{{ item.name }}</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-primary" data-dismiss="modal">Save</button>
					</div>
				</div>
			</div>
		</div>
		<div class="row">
			<div class="col">
				<div class="form-group storeSuggestionsGroup">
					<input class="form-control" type="text" v-model="store" placeholder="Find a nearby store..." @input="GetStores" />
					<div id="storeSuggestions" v-if="storeSuggestions.length > 0 && !storeId.length">
						<div v-for="item in storeSuggestions" class="item" @click="GetMenu(item.StoreID, item.AddressDescription)">
							<span class="phone"><span class="bold text-light">Phone:</span> {{ item.Phone }}</span>
							<span class="address"><span class="bold text-light">Address:</span> {{ item.AddressDescription }}</span>
							<span class="hours"><span class="bold text-light">Hours:</span> {{ item.HoursDescription }}</span>
						</div>
					</div>
				</div>
			</div>
			<div class="col" v-if="storeId && menuItems.length > 0">
				<button id="showMenuButton" type="button" class="btn btn-primary" data-toggle="modal" data-target="#menuModal">
					Show Menu
				</button>
			</div>
		</div>
	</div>
`,
	data() {
		return {
			store: "",
			storeId: "",
			storeSuggestions: [],
			menuItems: [],
			orderItems: [],
			searchFilter: ""
		}
	},
	computed: {
		filteredMenuItems() {
			if (this.searchFilter) {
				return this.menuItems.filter((val) => {
					if (val.name.toLowerCase().match(this.searchFilter.toLowerCase())) {
						return val;
					}
				});
			}
			else {
				return this.menuItems;
			}
		},
		displayOrderItems() {
			return this.menuItems.filter((val) => {
				if (this.orderItems.indexOf(val.code) !== -1) {
					return val;
				}
			});
		}
	},
	methods: {
		Initialize() {
			this.storeId = "",
			this.orderItems = [],
			this.menuItems = [],
			this.OrderChange();
			this.StoreChange();
		},
		GetStores() {
			if (this.store.length === 0) this.Initialize();
			axios.post('/Stores', { address: this.store }).then((res) => {
				this.storeSuggestions = res.data;
			}).catch((err) => {
				console.log(err);
			});
		},
		GetMenu(storeId, address) {
			this.storeId = storeId;
			this.store = address;
			this.StoreChange();
			axios.post('/Menu', {storeId : this.storeId}).then((res) => {
				this.menuItems = res.data;
			}).catch((err) => {
				console.log(err);
			});
		},
		StoreChange() {
			this.$emit('update-store', this.storeId);
		},
		OrderChange() {
			this.$emit('update-order', this.orderItems);
		}
	}
});

// application
let app = new Vue({
	el: '#app',
	data() {
		return {
			store: "",
			items: [],
		}
	},
	methods: {
		updateOrder(val) {
			this.items = val;
		},
		updateStore(val) {
			this.store = val;
		}
	}
});