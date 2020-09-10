//BudgetController
var budgetController = (function() { //anon function is first declared

    //These are the constructors and from here we will be making many different objects
    var Expense = function(id, description, value) { 

        this.id = id; 
        this.description = description; 
        this.value = value; 
	    this.percentage = -1; 

    }; 

    Expense.prototype.calcPercentage = function(totalIncome) { 

        if ( totalIncome > 0 ) {
        this.percentage =  Math.round (( this.value / totalIncome ) * 100); 
        } else { 
            this.percentage = -1; 
        }

    };

    Expense.prototype.getPercentage = function () { 
        return this.percentage; 
    };

    var Income = function (id, description, value) { 
        this.id = id; 
        this.description = description; 
        this.value = value; 
    }; 


  
    var calculateTotal = function(type) { 

        var sum = 0; 

        data.allItems[type].forEach(function(cur) { 

            sum = sum + cur.value; 

        }); 
        data.totals[type] = sum; 

    }; 


    var data = { 

        allItems: {
            exp:[], 
            inc:[]
        },

        totals: { 
            exp:0, 
            inc:0 
        },
        
        budget:0,
        percentage: -1 
       
    }; 

    return { 

        addItem: function(type, des, val) { 
            
            var newItem, ID; 
           

            //Create new ID

            if (data.allItems[type].length > 0 ) {

            ID = data.allItems[type][data.allItems[type].length - 1].id + 1; 
            
            }
            else { 
                ID = 0;
            }

            //Create the new  item based on type 
            if ( type === 'exp') { 
            newItem = new Expense(ID, des, val);

            } else if ( type === 'inc') { 

            newItem = new Income(ID,des,val); 

            }

            //Push into data structure

            //Dont need if because they have the same name 
            data.allItems[type].push(newItem); //array will be selected accordingly
            
            //Return the element 
            return newItem; 

        },

        deleteItem: function(type, id ) { 

            var ids, index; 

            /*cant select with the id because the order of the id's might be different, so instead 
            we want to find out what index the deleted item will be*/ 
            

            
            ids = data.allItems[type].map(function(current) { //we will return a brand new array for map, 

                return current.id; 
            
            }); 

            index = ids.indexOf(id); //using the returned id to get the index of it 

            if ( index !== -1 ) { 

                data.allItems[type].splice(index, 1); //index and #of elements we want to remove

            }

        },

        calculateBudget: function() { 

            //calculate the total income and expenses 
            calculateTotal('exp'); 
            calculateTotal('inc'); 

            //calcualte the budget : income - expenses 
            data.budget = data.totals.inc - data.totals.exp; 


            //calculate the  percentage of income that we spent 

            if ( data.totals.inc > 0 ) {

            data.percentage =  Math.round((data.totals.exp / data.totals.inc) * 100); 
            } else {
                data.percentage = -1; 
            }

        },

        calculatePercentages: function() { 

            data.allItems.exp.forEach(function(cur) { 

                cur.calcPercentage(data.totals.inc); 

            }); 

        }, 

        getPercentages: function() { 

            var allPerc = data.allItems.exp.map(function(cur) { //map returns and stores 

                return cur.getPercentage(); 
            }); 

            return allPerc; //then an array with all of the percentages are returned

        }, 

        getBudget: function() { 

            return  { 
                budget: data.budget, 
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };

        }, 

        testing:function() { 
            console.log(data);
        }

    };



})(); //so after this runs the budget controller is simply an object containing the method


//UIController
//There wont be any interaction between the modules 
var UIController = (function() {

    //This is so that we dont need to keep repeating the same strings
    var DOMstrings =  { 

        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
        
    };

    //We moved this method here because we want it to be a private function as its only used here
    var  formatNumber =  function(num, type) { 

        var numSplit, int, dec; 

        /*we want to add a + or - exactly 2 decmial ponts*/ 
        num = Math.abs(num); //removes the sign of the number
        num = num.toFixed(2); //for decimal places, and rounding it to that decimal point 

        //can split on the decimal to get both parts of the string
        numSplit = num.split('.'); 

        int = numSplit[0]; 
        dec = numSplit[1]; 

        //if its in the thousands
        if ( int.length > 3) { 

            //Here we start from the whole number, add the comma, and grab the rest of the number 
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length-3,int.length ); //input 2310, output 2,310
            
        }

     
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec; //return the whole formatted string here 


    };

    var nodeListForEach = function(list, callback) { 

        for ( var i = 0; i < list.length; i++) { 
            callback(list[i], i); 
        }

    }; 

    //we want a public method so we will be returning it so that its assigned to the UI controller 
    return {
        
        getInput: function() {

            //We want to return all 3 properties at the same time and we can do this with an object 
            return {

                type: document.querySelector(DOMstrings.inputType).value,  //for the incomes and expenses on HTML document ( either INC or EXP )
                description: document.querySelector(DOMstrings.inputDescription).value, //description of the expense or income
                value: parseFloat (document.querySelector(DOMstrings.inputValue).value) //Value of it, which is converted


            };

        }, 

        addListItem: function(obj, type) { 

            var html, newHTML, element; 

            //Create HTML string with some placeholder text
            if ( type === 'inc') { 
            

            //With these strings what we are doing is filling in the information from the object 

            element = DOMstrings.incomeContainer; 
            html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"><div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'

            } else if ( type === 'exp') {
            
            element = DOMstrings.expensesContainer; 
            html =  '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'

            }

            //Replace the placeholder text with some actual data, we use replace which searches and replaces
            newHTML = html.replace('%id%', obj.id); 
            newHTML = newHTML.replace('%description%', obj.description); 
            newHTML = newHTML.replace('%value%', formatNumber (obj.value,type)); 

            //insert the HTML into the dom, and theres different places for insertion so I can check online for this 
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML); 

        }, 

        deleteListItem: function(selectorID) { 

            var selection; 

             //we have to move up in the dom so that we can delete the child 
             selection =  document.getElementById(selectorID);
             selection.parentNode.removeChild(selection);
        }, 

        //For clearing the fields in the UI
        clearFields: function() { 

        var fields, fieldsArr; 


        //we selected both of these because these need to be cleared after they are typed
        fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue ); //this returns a list

        //converting the list into an array 
        fieldsArr = Array.prototype.slice.call(fields); //tricks slice method into thinking we are giving it an array
        
        fieldsArr.forEach(function(current, index, array) { //from javascript themselves

            current.value = ""; 
        
        });

        fieldsArr[0].focus(); //focuses on the 0th element of this array
        

        }, 

        displayBudget: function(obj) { 

            var type; 
            obj.budget > 0 ? type = 'inc' : type = 'exp'; 

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type); 
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc'); 
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp'); 
           

            if ( obj.percentage > 0) { 

                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else { 
                document.querySelector(DOMstrings.percentageLabel).textContent = '---'; 
            }


        },

        displayPercentages: function(percentages) { 

            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel); 

           

            nodeListForEach(fields, function(current, index){ 

                if (percentages[index] > 0 )
                {
                
                current.textContent = percentages[index] + '%'; 

                } else { 
                    current.textContent = '---'; 
                }

            }); 

        }, 

        displayMonth: function() { 

            var now, year, month, months; 
            now = new Date(); //Date of today 
            month = now.getMonth(); //gets the month from the date
            year = now.getFullYear(); //the year from that date 

            months = ['January', 'Februrary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 
                    'October', 'November', 'December']; 

            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year; //Make changes to the html class itself 



        }, 

        changedType: function() { 

            //Changing the outline for when the income is pressed, so we will be doing style manipulation
            var fields = document.querySelectorAll(Domstrings.inputType + ',' + DOMstrings.inputDescription + ',' +  DOMstrings.inputValue);

                
                nodeListForEach(fields, function(cur) {     

                    cur.classList.toggle('red-focus'); //will add and remove, so each time the type changes it changes

                }); 

        }, 
       

        getDOMstrings: function() { 
            return DOMstrings; //With these we expose the object to public use
        }
    };

})(); 

//But we need a way to connect them
//Inside this module the params will have a different name but are assigned to the original variable 
var controller = (function(budgetCtrl, UICtrl) {

    var setupEventListeners = function() { 

        var DOM = UICtrl.getDOMstrings(); 

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem); 

        //For the key presses for "enter" key, we can look at the event references for this 
        document.addEventListener('keypress', function(event) { //the event can be named anything 
    
            //The keycode represents what key we pressed, and this is how they are identified 
            if ( event.keyCode === 13 || event.which === 13  ) { 
                
                ctrlAddItem(); 
    
    
            }

            //We looked for an HTML element which is a parent class, so we find the element that is common  to all of them 
            document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem); 

            document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    
        }); 

    };

    var updateBudget = function() { 


       //1. Calculate the budget
       budgetCtrl.calculateBudget(); 

       //2. returns the budget 
       var budget = budgetCtrl.getBudget(); 

       //3. Display the budget on the UI 
       UICtrl.displayBudget(budget);
       

    }; 

    var updatePercentages = function() { 

        //Calculate the percentages
        budgetCtrl.calculatePercentages(); 

        //Read percentages from the budget controller 
        var percentages = budgetCtrl.getPercentages(); 

        //update the UI with the new percentages
        UICtrl.displayPercentages(percentages);

    };

    //Telling the other modules what to do 
    var ctrlAddItem = function() { 

       var input, newItem; 

       // 1.Get the field input data
       input = UICtrl.getInput(); 
        
       //Only want everything to happen if theres actually data within the boxes
       if ( input.description !== "" && !isNaN(input.value ) && input.value > 0 ) { 

            //2. add the item to the budget controller 
            newItem = budgetCtrl.addItem(input.type, input.description, input.value); 

            //3. Add the item to the UI by displaying it 
            UICtrl.addListItem(newItem, input.type); 

            //4.clear the fields
            UICtrl.clearFields();

            //5. calculate and update the budget 
            updateBudget(); 

            //calculate and update the percentages 
            updatePercentages(); 


       }

       
    };

    var ctrlDeleteItem = function(event) { 

        var itemID, splitID, type, ID; 

        /*target.element lets us see where the event was fired, 
        and when deleting we need to take out the parent class because we dont want all of that showing 
        in the user interface basically*/

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id; //Did this 4 times to get the actual parent 

        if ( itemID ) { //if exits it will be true and if it doesnt it will be false 

            //things in js get transformed from primitive to object, and returns an array of inc and what's after
            splitID = itemID.split('-'); 
            type = splitID[0]; 
            ID = parseInt (splitID[1]) ; //for just integers 

    

            // 1. delete the item from the data structure 
            budgetCtrl.deleteItem(type, ID); 

            //2. delete the item from the UI
            UICtrl.deleteListItem(itemID);

            //3. update and show the new budget 
            updateBudget(); 

            //calculate and update the percentages 
            updatePercentages(); 


       }



    }; 


    return {
        init: function() {
            console.log('Application has started.');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget:0,   //Setting everythiing to 0
                totalInc:0,
                totalExp: 0,
                percentage: -1
                
            });
            setupEventListeners();
        }
    };
    
})(budgetController, UIController);


controller.init();