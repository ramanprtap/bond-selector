/**
 * @name Multi-step form - WIP
 * @description Prototype for basic multi-step form
 * @deps jQuery, jQuery Validate
 */

var app = {

	init: function(){
		this.cacheDOM();
		this.setupAria();
		this.nextButton();
		this.prevButton();
		this.validateForm();
		this.startOver();
		this.editForm();
		this.killEnterKey();
		this.handleStepClicks();
	},

	cacheDOM: function(){
		if($(".multi-step-form").size() === 0){ return; }
		this.$formParent = $(".multi-step-form");
		this.$form = this.$formParent.find("form");
		this.$formStepParents = this.$form.find("fieldset"),

		this.$nextButton = this.$form.find(".btn-next");
		this.$prevButton = this.$form.find(".btn-prev");
		this.$editButton = this.$form.find(".btn-edit");
		this.$resetButton = this.$form.find("[type='reset']");

		this.$stepsParent = $(".steps");
		this.$steps = this.$stepsParent.find("button");
	},

	htmlClasses: {
		activeClass: "active",
		hiddenClass: "hidden",
		visibleClass: "visible",
		editFormClass: "edit-form",
		animatedVisibleClass: "animated fadeIn",
		animatedHiddenClass: "animated fadeOut",
		animatingClass: "animating"
	},

	setupAria: function(){

		// set first parent to visible
		this.$formStepParents.eq(0).attr("aria-hidden",false);

		// set all other parents to hidden
		this.$formStepParents.not(":first").attr("aria-hidden",true);

		// handle aria-expanded on next/prev buttons
		app.handleAriaExpanded();

	},

	nextButton: function(){

		this.$nextButton.on("click", function(e){

			e.preventDefault();

			// grab current step and next step parent
			var $this = $(this),
					currentParent = $this.closest("fieldset"),
					nextParent = currentParent.next();

					// if the form is valid hide current step
					// trigger next step
					if(app.checkForValidForm()){
						currentParent.removeClass(app.htmlClasses.visibleClass);
						app.showNextStep(currentParent, nextParent);
					}

		});
	},

	prevButton: function(){

		this.$prevButton.on("click", function(e){

			e.preventDefault();

			// grab current step parent and previous parent
			var $this = $(this),
					currentParent = $(this).closest("fieldset"),
					prevParent = currentParent.prev();

					// hide current step and show previous step
					// no need to validate form here
					currentParent.removeClass(app.htmlClasses.visibleClass);
					app.showPrevStep(currentParent, prevParent);

		});
	},

	showNextStep: function(currentParent,nextParent){

		// hide previous parent
		currentParent
			.addClass(app.htmlClasses.hiddenClass)
			.attr("aria-hidden",true);

		// show next parent
		nextParent
			.removeClass(app.htmlClasses.hiddenClass)
			.addClass(app.htmlClasses.visibleClass)
			.attr("aria-hidden",false);

		// focus first input on next parent
		// nextParent.focus();
		
		// browning: focus first input on next parent
		nextParent.find(":input").first().focus();

		// activate appropriate step
		app.handleState(nextParent.index());

		// handle aria-expanded on next/prev buttons
		app.handleAriaExpanded();

	},

	showPrevStep: function(currentParent,prevParent){

		// hide previous parent
		currentParent
			.addClass(app.htmlClasses.hiddenClass)
			.attr("aria-hidden",true);

		// show next parent
		prevParent
			.removeClass(app.htmlClasses.hiddenClass)
			.addClass(app.htmlClasses.visibleClass)
			.attr("aria-hidden",false);

		// send focus to first input on next parent
		// prevParent.focus();
		
		// browning: send focus to first input on next parent
		prevParent.find(":input").first().focus();

		// activate appropriate step
		app.handleState(prevParent.index());

		// handle aria-expanded on next/prev buttons
		app.handleAriaExpanded();

	},

	handleAriaExpanded: function(){

		/*
			Loop thru each next/prev button
			Check to see if the parent it conrols is visible
			Handle aria-expanded on buttons
		*/
		$.each(this.$nextButton, function(idx,item){
			var controls = $(item).attr("aria-controls");
			if($("#"+controls).attr("aria-hidden") == "true"){
				$(item).attr("aria-expanded",false);
			}else{
				$(item).attr("aria-expanded",true);
			}
		});

		$.each(this.$prevButton, function(idx,item){
			var controls = $(item).attr("aria-controls");
			if($("#"+controls).attr("aria-hidden") == "true"){
				$(item).attr("aria-expanded",false);
			}else{
				$(item).attr("aria-expanded",true);
			}
		});

	},

	validateForm: function(){
		// jquery validate form validation
		this.$form.validate({
			ignore: ":hidden", // any children of hidden desc are ignored
			errorElement: "span", // wrap error elements in span not label
			errorClass: "error-text", // Sarah added error class to span
			errorPlacement: function(error, element) {  // Sarah added to insert before to work better with radio buttions
				if(element.attr("type") == "radio") {
					error.insertBefore(element);
				}
				else
					{
						error.insertAfter(element);
					}
			},
			invalidHandler: function(event, validator){ // add aria-invalid to el with error
				$.each(validator.errorList, function(idx,item){
					if(idx === 0){
						$(item.element).focus(); // send focus to first el with error
					}
					$(item.element).attr({"aria-invalid": true, "aria-required": true}); // add invalid aria sarah added & aria-required
				})
			},
			submitHandler: function(form) {
				//alert("form submitted!");
		    // form.submit();
		  }
		});
	},

	checkForValidForm: function(){
		if(this.$form.valid()){
			return true;
		}
	},

	startOver: function(){

		var $parents = this.$formStepParents,
				$firstParent = this.$formStepParents.eq(0),
				$formParent = this.$formParent,
				$stepsParent = this.$stepsParent;

				this.$resetButton.on("click", function(e){

					// hide all parents - show first
					$parents
						.removeClass(app.htmlClasses.visibleClass)
						.addClass(app.htmlClasses.hiddenClass)
						.eq(0).removeClass(app.htmlClasses.hiddenClass)
						.eq(0).addClass(app.htmlClasses.visibleClass);

						// remove edit state if present
						$formParent.removeClass(app.htmlClasses.editFormClass);

						// manage state - set to first item
						app.handleState(0);

						// reset stage for initial aria state
						app.setupAria();

						// send focus to first item
						setTimeout(function(){
							$firstParent.focus();
						},200);

				}); // click

	},

	handleState: function(step){

		this.$steps.eq(step).prevAll().removeAttr("disabled");
		this.$steps.eq(step).addClass(app.htmlClasses.activeClass);

		// restart scenario
		if(step === 0){
			this.$steps
				.removeClass(app.htmlClasses.activeClass)
				.attr("disabled","disabled");
			this.$steps.eq(0).addClass(app.htmlClasses.activeClass)
		}

	},

	editForm: function(){
		var $formParent = this.$formParent,
				$formStepParents = this.$formStepParents,
				$stepsParent = this.$stepsParent;

				this.$editButton.on("click",function(){
					$formParent.toggleClass(app.htmlClasses.editFormClass);
					$formStepParents.attr("aria-hidden",false);
					$formStepParents.eq(0).find("input").eq(0).focus();
					app.handleAriaExpanded();
				});
	},

	killEnterKey: function(){
		$(document).on("keypress", ":input:not(textarea,button)", function(event) {
			return event.keyCode != 13;
		});
	},

	handleStepClicks: function(){

		var $stepTriggers = this.$steps,
				$stepParents = this.$formStepParents;

				$stepTriggers.on("click", function(e){

					e.preventDefault();

					var btnClickedIndex = $(this).index();

						// kill active state for items after step trigger
						$stepTriggers.nextAll()
							.removeClass(app.htmlClasses.activeClass)
							.attr("disabled",true);

						// activate button clicked
						$(this)
							.addClass(app.htmlClasses.activeClass)
							.attr("disabled",false)

						// hide all step parents
						$stepParents
							.removeClass(app.htmlClasses.visibleClass)
							.addClass(app.htmlClasses.hiddenClass)
							.attr("aria-hidden",true);

						// show step that matches index of button
						$stepParents.eq(btnClickedIndex)
							.removeClass(app.htmlClasses.hiddenClass)
							.addClass(app.htmlClasses.visibleClass)
							.attr("aria-hidden",false)
							.focus();

				});

	}

};

app.init();



//  function redirect() {
// 	window.location.replace("next-page.html")
// 	return false;
//   }
var countryStateInfo = {
	"United States": {
		"California": {
			"Los Angeles": ["90001", "90002", "90003", "90004"],
			"San Diego": ["92093", "92101"]
		},
		"Texas": {
			"Dallas": ["75201", "75202"],
			"Austin": ["73301", "73344"]
		}
	},
	"India": {
		"Maharashtra": {
			"Mumbai": ["400030"],
			"Thane" : ["400030", "400013"]
		},
		"Gujarat": {
			"Vadodara" : ["390011", "390020"],
			"Surat" : ["395006", "395002"]
		}
	}
}


window.onload = function () {
	
	//Get html elements
	var countySel = document.getElementById("countySel");
	var stateSel = document.getElementById("stateSel");	
	var citySel = document.getElementById("citySel");
	var zipSel = document.getElementById("zipSel");
	
	//Load countries
	for (var country in countryStateInfo) {
		countySel.options[countySel.options.length] = new Option(country, country);
	}
	
	//County Changed
	countySel.onchange = function () {
		 
		 stateSel.length = 1; // remove all options bar first
		 citySel.length = 1; // remove all options bar first
		 zipSel.length = 1; // remove all options bar first
		 
		 if (this.selectedIndex < 1)
			 return; // done
		 
		 for (var state in countryStateInfo[this.value]) {
			 stateSel.options[stateSel.options.length] = new Option(state, state);
		 }
	}
	
	//State Changed
	stateSel.onchange = function () {		 
		 
		 citySel.length = 1; // remove all options bar first
		 zipSel.length = 1; // remove all options bar first
		 
		 if (this.selectedIndex < 1)
			 return; // done
		 
		 for (var city in countryStateInfo[countySel.value][this.value]) {
			 citySel.options[citySel.options.length] = new Option(city, city);
		 }
	}
	
	//City Changed
	citySel.onchange = function () {
		zipSel.length = 1; // remove all options bar first
		
		if (this.selectedIndex < 1)
			return; // done
		
		var zips = countryStateInfo[countySel.value][stateSel.value][this.value];
		for (var i = 0; i < zips.length; i++) {
			zipSel.options[zipSel.options.length] = new Option(zips[i], zips[i]);
		}
	}	
}

/**
 * Checks that an element has a non-empty `name` and `value` property.
 * @param  {Element} element  the element to check
 * @return {Bool}             true if the element is an input, false if not
 */
const isValidElement = element => {
	return element.name && element.value;
  };
  
  /**
   * Checks if an element’s value can be saved (e.g. not an unselected checkbox).
   * @param  {Element} element  the element to check
   * @return {Boolean}          true if the value should be added, false if not
   */
  const isValidValue = element => {
	return (!['checkbox', 'radio'].includes(element.type) || element.checked);
  };
  
  /**
   * Checks if an input is a checkbox, because checkboxes allow multiple values.
   * @param  {Element} element  the element to check
   * @return {Boolean}          true if the element is a checkbox, false if not
   */
  const isCheckbox = element => element.type === 'checkbox';
  
  /**
   * Checks if an input is a `select` with the `multiple` attribute.
   * @param  {Element} element  the element to check
   * @return {Boolean}          true if the element is a multiselect, false if not
   */
  const isMultiSelect = element => element.options && element.multiple;
  
  /**
   * Retrieves the selected options from a multi-select as an array.
   * @param  {HTMLOptionsCollection} options  the options for the select
   * @return {Array}                          an array of selected option values
   */
  const getSelectValues = options => [].reduce.call(options, (values, option) => {
	return option.selected ? values.concat(option.value) : values;
  }, []);
  
  /**
   * A more verbose implementation of `formToJSON()` to explain how it works.
   *
   * NOTE: This function is unused, and is only here for the purpose of explaining how
   * reducing form elements works.
   *
   * @param  {HTMLFormControlsCollection} elements  the form elements
   * @return {Object}                               form data as an object literal
   */
  const formToJSON_deconstructed = elements => {
	
	// This is the function that is called on each element of the array.
	const reducerFunction = (data, element) => {
	  
	  // Add the current field to the object.
	  data[element.name] = element.value;
	  
	  // For the demo only: show each step in the reducer’s progress.
	  console.log(JSON.stringify(data));
  
	  return data;
	};
	
	// This is used as the initial value of `data` in `reducerFunction()`.
	const reducerInitialValue = {};
	
	// To help visualize what happens, log the inital value, which we know is `{}`.
	console.log('Initial `data` value:', JSON.stringify(reducerInitialValue));
	
	// Now we reduce by `call`-ing `Array.prototype.reduce()` on `elements`.
	const formData = [].reduce.call(elements, reducerFunction, reducerInitialValue);
	
	// The result is then returned for use elsewhere.
	return formData;
  };
  
  /**
   * Retrieves input data from a form and returns it as a JSON object.
   * @param  {HTMLFormControlsCollection} elements  the form elements
   * @return {Object}                               form data as an object literal
   */
  const formToJSON = elements => [].reduce.call(elements, (data, element) => {
  
	// Make sure the element has the required properties and should be added.
	if (isValidElement(element) && isValidValue(element)) {
  
	  /*
	   * Some fields allow for more than one value, so we need to check if this
	   * is one of those fields and, if so, store the values as an array.
	   */
	  if (isCheckbox(element)) {
		data[element.name] = (data[element.name] || []).concat(element.value);
	  } else if (isMultiSelect(element)) {
		data[element.name] = getSelectValues(element);
	  } else {
		data[element.name] = element.value;
	  }
	}
  
	return data;
  }, {});
  
 /**
   * A handler function to prevent default submission and run our custom script.
   * @param  {Event} event  the submit event triggered by the user
   * @return {void}
   */
  const handleFormSubmit = event => {
	
	// Stop the form from submitting since we’re handling that with AJAX.
	event.preventDefault();
	
	// Call our function to get the form data.
	const data = formToJSON(form.elements);
  
	// Demo only: print the form data onscreen as a formatted JSON object.
	const dataContainer = document.getElementsByClassName('results__display')[0];
 
	
	// Use `JSON.stringify()` to make the output valid, human-readable JSON.
	dataContainer.textContent = JSON.stringify(data, null, "  ");
	
	console.log(dataContainer.textContent);
	localStorage.setItem("myObj", dataContainer.textContent);
	console.log(dataContainer.textContent);

	

	var defaultData = [data];
	  
	  var dom = {
		$data: $('#data'),
		$table: $('#table'),
	  };
	  
	  function json2table(json, $table) {
		var cols = Object.keys(json[0]);
	  
		var headerRow = '';
		var bodyRows = '';
	  
		function capitalizeFirstLetter(string) {
		  return string.charAt(0).toUpperCase() + string.slice(1);
		}
		
		$table.html('<thead><tr></tr></thead><tbody></tbody>');
	  
		cols.map(function(col) {
		  headerRow += '<th>' + capitalizeFirstLetter(col) + '</th>';
		});
	  
		json.map(function(row) {
		  bodyRows += '<tr>';
	  
		  cols.map(function(colName) {
			bodyRows += '<td>' + row[colName] + '</td>';
		  })
	  
		  bodyRows += '</tr>';
		});
	  
		$table.find('thead tr').append(headerRow);
		$table.find('tbody').append(bodyRows);
	  }
	  
	  dom.$data.val(JSON.stringify(defaultData));
	  json2table(defaultData, dom.$table);
	  
	  dom.$data.on('input', function() {
		json2table(JSON.parse(dom.$data.val()), dom.$table);
	  });
	  

  };
  
	// let reverseData = JSON.stringify(localStorage.getItem('myObj'));
	// console.log(reverseData);

  /*
   * This is where things actually get started. We find the form element using
   * its class name, then attach the `handleFormSubmit()` function to the 
   * `submit` event.
   */
  const form = document.getElementsByClassName('contact-form')[0];
  form.addEventListener('submit', handleFormSubmit);
  



$(function () {
	$("#client_graph_form").hide();
	$("#pilot_graph_form").hide();
	$("#selectOpt").change(function() {
	  var val = $(this).val();
	  if(val === "Fixed Income") {
		  $("#pilot_graph_form").show();
		  $("#client_graph_form").hide();
	  }
	  else if(val === "Forex") {
		  $("#client_graph_form").show();
		  $("#pilot_graph_form").hide();
	  }
	});
  });

//   multiply fuction
function multiply() { 
	const multiplicand = document.getElementById('multiplicand').value || 0; 
	const multiplier = document.getElementById('multiplier').value || 0; 
	const product  =(multiplicand) * (multiplier);
	var num = product;
	var n = product.toFixed(4);
	document.getElementById('showProduct').value = n; 
  }
