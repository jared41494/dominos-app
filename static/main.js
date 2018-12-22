// intro text component
Vue.component('intro', {
	template: `
	<div id="intro">
		<h1 class="text-center">{{ title }}</h1>
		<p>
			Welcome to my Dominos Online Ordering application! This application utilizes NodeJS and a Dominos API on the backend and Vue.js and Bootstrap on the frontend to allow people to order some dominos quickly. 
		</p>
		<p>
			This application is <span class="uppercase">Live</span>!
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
	<form name="placeOrder" id="placeOrder" method="post" action="/" @submit="SubmitOrder" v-if="store && orderitems.length > 0">
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
					<input class="form-control" type="text" v-model="Customer.address.Street" required="required" maxlength="150" placeholder="1200 Fake Lane" />
				</div>
				<div class="form-group">
					<label for="city">City</label>
					<input class="form-control" type="text" v-model="Customer.address.City" required="required" maxlength="75" placeholder="Fake" />
				</div>
				<div class="form-group">
					<label for="region">State</label>
					<input class="form-control" type="text" v-model="Customer.address.Region" required="required" maxlength="2" placeholder="AA" />
				</div>
				<div class="form-group">
					<label for="postalCode">Zip</label>
					<input class="form-control" type="text" v-model="Customer.address.PostalCode" required="required" maxlength="5" placeholder="55555" />
				</div>
			</div>
			<div class="col">
				<h2>Customer Information</h2>
				<div class="form-group">
					<label for="firstName">First Name</label>
					<input class="form-control" type="text" v-model="Customer.firstName" required="required" maxlength="75" placeholder="John" />
				</div>
				<div class="form-group">
					<label for="lastName">Last Name</label>
					<input class="form-control" type="text" v-model="Customer.lastName" required="required" maxlength="150" placeholder="Smith" />
				</div>
				<div class="form-group">
					<label for="phone">Phone</label>
					<input class="form-control" type="phone" v-model="Customer.phone" required="required" maxlength="10" placeholder="5555555555" />
				</div>
				<div class="form-group">
					<label for="email">Email</label>
					<input class="form-control" type="email" v-model="Customer.email" required="required" maxlength="75" placeholder="john@smith.com" />
				</div>
			</div>
			<div class="col">
				<h2>Credit Card Information</h2>
				<div class="form-group">
					<label for="creditCardNumber">Card Number</label>
					<input class="form-control" type="text" v-model="cardInfo.Number" required="required" maxlength="16" placeholder="0000000000000000" />
				</div>
				<div class="form-group">
					<label for="expirationDate">Expiration Date</label>
					<input class="form-control" type="text" v-model="cardInfo.Expiration" required="required" maxlength="4" placeholder="1111" />
				</div>
				<div class="form-group">
					<label for="securityCode">Secuirty Code</label>
					<input class="form-control" type="text" v-model="cardInfo.SecurityCode" required="required" maxlength="3" placeholder="000" />
				</div>
				<div class="form-group">
					<label for="billingZip">Billing Zip</label>
					<input class="form-control" type="text" v-model="cardInfo.PostalCode" required="required" maxlength="5" placeholder="55555" />
				</div>
			</div>
		</div>
		<div class="row">
			<div class="col-12">
				<input class="btn btn-primary" type="submit" value="Place Order" v-if="!orderComplete" />
			</div>
		</div>
	</form>
`,
	data() {
		return {
			formErrors: [],
			Customer: {
				firstName: "",
				lastName: "",
				phone: "",
				email: "",
				address: {
					Street: "",
					City: "",
					PostalCode: "",
					Region: ""
				}
			},
			cardInfo: {
				Number: "",
				Expiration: "",
				SecurityCode: "",
				PostalCode: ""
			},
			orderComplete: false
		}
	},
	watch: {
		Customer: {
			handler(newVal) {
				this.Customer.phone = this.NumbersOnly(newVal.phone);
				this.Customer.address.PostalCode = this.NumbersOnly(newVal.address.PostalCode);
				this.Customer.address.Region = newVal.address.Region.toUpperCase();
			},
			deep: true
		},
		cardInfo: {
			handler(newVal) {
				this.cardInfo.Number = this.NumbersOnly(newVal.Number);
				this.cardInfo.Expiration = this.NumbersOnly(newVal.Expiration);
				this.cardInfo.SecurityCode = this.NumbersOnly(newVal.SecurityCode);
				this.cardInfo.PostalCode = this.NumbersOnly(newVal.PostalCode);
			},
			deep: true
		}
	},
	methods: {
		NumbersOnly(value) {
			if (!value) return '';
			return value.replace(/[^0-9]/g, '');
		},
		CheckOrder() {
			this.formErrors = [];

			if (!this.Customer.email.match(/\w+@\w+\.\w{3,4}/gi)) { this.formErrors.push("Email is invalid!\n"); }

			if (!this.Customer.phone.match(/^\d{10}$/gi)) { this.formErrors.push("Phone is invalid!\n"); }

			if (this.formErrors.length > 0) { return false; } 

			return true;
		},
		SubmitOrder(e) {
			e.preventDefault();
			if (this.CheckOrder()) {
				axios.post('/Order', {
					storeId: this.store,
					orderItems: this.orderitems,
					Customer: this.Customer,
					cardInfo: this.cardInfo
				}).then((res) => {
					if (res.data.hasOwnProperty("isJoi")) {
						alert(res.data.details[0]["message"]);
					} else if (res.data.hasOwnProperty("error")) {
						alert(res.data.error);
					}
					else {
						this.orderComplete = true;
						alert(res.data.success);
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
									<input type="checkbox" name="orderItems[]" v-model="orderItems" :value="item.code" />
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
									<td><input type="checkbox" name="orderItems[]" v-model="orderItems" :value="item.code" /></td>
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
	watch: {
		storeId(newVal, oldVal) {
			this.$emit('update-store', this.storeId);
		},
		orderItems(newVal, oldVal) {
			this.$emit('update-order', this.orderItems);
		}
	},

	methods: {
		Initialize() {
			this.storeId = "",
			this.orderItems = [],
			this.menuItems = [],
			this.searchFilter = ""
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
			axios.post('/Menu', {storeId : this.storeId}).then((res) => {
				this.menuItems = res.data;
			}).catch((err) => {
				console.log(err);
			});
		}
	}
});

// application
let app = new Vue({
	el: '#app',
	data() {
		return {
			store: "",
			items: []
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