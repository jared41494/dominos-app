let app = new Vue({
	el: '#app',
	data() {
		return {
			title: "Order Some Dominos!",
			storeId: "",
			store: "",
			storeSuggestions: [],
			menuItems: [],
			orderItems: [],
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
			billingZip: "",
			searchFilter: ""
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
			let allowedChars = /[0-9]/g;
			let newValLen = newVal.length;
			let char = newVal.slice(newValLen - 1, newValLen);

			if (newValLen > oldVal.length) {
				if (char.match(allowedChars)) {
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
			this.menuItems = []
		},
		NumbersOnly(value) {
			return value.replace(/[^0-9]/g, '');
			//e.target.value = e.target.value.replace(/[^0-9]/g, '');
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
				console.log(res.data);
				this.menuItems = res.data;
			}).catch((err) => {
				console.log(err);
			});
		},
		CheckOrder() {
			this.formErrors = [];
			let emailRegex = /\w+@\w+\.\w{3,4}/gi;
			let phoneRegex = /\d{3}-\d{3}-\d{4}/gi;

			// additional validation to supplement HTML5 validation
			if (!this.email.match(emailRegex)) {
				this.formErrors.push("Email is invalid!");
			}

			if (!this.phone.match(phoneRegex)) {
				this.formErrors.push("Phone is invalid!");
			}

			if (!this.storeId) {
				this.formErrors.push("You must select a nearby store!");
			}

			if (this.orderItems.length === 0) {
				this.formErrors.push("You must select items to order!");
			}

			if (this.formErrors.length > 0) {
				return false;
			} 

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

				//return true;
			}

			return false;
		}
	}
});
