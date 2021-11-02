/**
 * Util class handles all the validations methods
 * that are being used in Labor Order app.
 * 
 * @class
 * @public
 * @extends sap.ui.base.Object
 * @file com.amat.spg.labord.util.Util
 * @author Vimal Pandu
 * @since 27 July 2020
 * ------------------------------------------------------------------------------------ *
 * Date     	Author 					PCR No.      Description of change				*
 * ----------  	--------------------	---------    ---------------------------------- *
 * 07/27/2020  	Vimal Pandu				PCR030784    Initial Version					*
 * 10/12/2020  	Vimal Pandu				PCR032047    Phase - 2 changes					*
 * ------------------------------------------------------------------------------------ */

sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/ValueState",
	"../model/ResponseHandler",
	"../util/IdHelper",
	"../util/Constants"
], function (Object, Filter, FilterOperator, ValueState, ResponseHandler, IdHelper, Constants) {
	"use strict";

	return Object.extend("com.amat.spg.labord.util.Util", {

		/**
		 * This method for validation of input fields.
		 * @name validateInputElements
		 * @param {Object[]} aElmntsRef - Holds the array of input fields 
		 * @returns {boolean} isMandatoryFieldCheckSuccess - mandatory field validation flag
		 */
		validateInputElements: function (aElmntsRef) {
			var isMandatoryFieldCheckSuccess = true;
			var oView = this.getView();

			for (var oElmntsRef in aElmntsRef) {
				if (!oView.byId(aElmntsRef[oElmntsRef]).getValue().trim()) {
					oView.byId(aElmntsRef[oElmntsRef]).setValueState(ValueState.Error);
					isMandatoryFieldCheckSuccess = false;
				} else {
					oView.byId(aElmntsRef[oElmntsRef]).setValueState(ValueState.None);
				}
			}
			return isMandatoryFieldCheckSuccess;
		},

		/**
		 * This method is used to validate Combobox elements.
		 * @name validateComboBoxElements
		 * @param {Object[]} aElmntsRef - array of element IDs
		 * @return {Object} validation success and combobox selected key
		 */
		validateComboBoxElements: function (aElmntsRef) {
			var isMandatoryFieldCheckSuccess = true;
			var aItems, oComboBox, sValue, aItemText, sElementId, oItem;
			var oSelectedItem = {};

			for (sElementId in aElmntsRef) {
				aItemText = [];
				oComboBox = this.getView().byId(aElmntsRef[sElementId]);
				sValue = oComboBox.getValue();
				aItems = oComboBox.getItems();

				for (oItem in aItems) {
					aItemText.push(aItems[oItem].getText());
				}

				if (sValue && aItemText.indexOf(sValue) > -1) {
					oSelectedItem[aElmntsRef[sElementId]] = aItems[aItemText.indexOf(sValue)].getKey();
					oComboBox.setValueState(ValueState.None);
				} else if (aItemText.indexOf(sValue) < 0 || oComboBox.getValueState() === ValueState.Error ||
					sValue === "") {
					oSelectedItem[aElmntsRef[sElementId]] = ""; //PCR032047++
					oComboBox.setValueState(ValueState.Error);
					isMandatoryFieldCheckSuccess = false;
				}
			}

			return {
				valid: isMandatoryFieldCheckSuccess,
				key: oSelectedItem
			};
		},

		/**
		 * This method is used to check the validations for the DatePicker fields
		 * @name getDateObj
		 * @param {String} sElementId - Element ID
		 * @returns {Object} oElmntVal - Date Object
		 */
		getDateObj: function (sElementId) {
			var oElement = this.getView().byId(sElementId);
			var regexForDtFormat = Constants.DATEFORMAT_REGEX;
			var soElmntVal = oElement.getValue().trim(),
				oElementDTValue = oElement.getDateValue();
			var oElmntVal, oDate;

			if (oElementDTValue) {
				oElmntVal = oElementDTValue;
			} else if (soElmntVal && regexForDtFormat.test(soElmntVal)) {
				oDate = soElmntVal;
				oDate = oDate.split("-").join(" ");
				oElmntVal = new Date(oDate);
			} else if (!oElementDTValue && !regexForDtFormat.test(soElmntVal)) {
				oElmntVal = soElmntVal;
			}
			return oElmntVal;
		},

		/**
		 * This method will set the value state of elements to none.
		 * @name setValueStateForElementsWithIDs
		 * @param {Object[]} aElementIDs - aElementIDs
		 * @param {string} sState - state
		 */
		setValueStateForElementsWithIDs: function (aElementIDs, sState) {
			var elementID, oElement;

			for (elementID in aElementIDs) {
				oElement = this.getView().byId(aElementIDs[elementID]);

				if (oElement) {
					oElement.setValueState(sState);
				}
			}
		},

		/**
		 * This method will clear the input of the fields.
		 * @name clearElementsWithIDs
		 * @param {Object[]} aElementIDs - array of elements
		 */
		clearElementsWithIDs: function (aElementIDs) {
			var elementID, oElement;

			for (elementID in aElementIDs) {
				oElement = this.getView().byId(aElementIDs[elementID]);

				if (oElement) {
					oElement.setValue("");
				}
			}
		},

		/**
		 * This method will deselect the selected key from Combo Box elements.
		 * @name clearSelectedItemInComboBox
		 * @param {Object[]} aElementIDs - array of elements
		 */
		clearSelectedItemInComboBox: function (aElementIDs) {
			var elementID, oElement;

			for (elementID in aElementIDs) {
				oElement = this.getView().byId(aElementIDs[elementID]);

				if (oElement) {
					oElement.setSelectedKey("");
				}
			}
		},

		/**
		 * This method will clear the state of switch elements.
		 * @name clearSwitchStates
		 * @param {Object[]} aElementIDs - array of elements
		 */
		clearSwitchStates: function (aElementIDs) {
			var elementID, oElement;

			for (elementID in aElementIDs) {
				oElement = this.getView().byId(aElementIDs[elementID]);

				if (oElement) {
					oElement.setState(false);
				}
			}
		},

		/**
		 * This method is to enable all the elements.
		 * @name enableElementsWithIDs
		 * @param {Object[]} aElementIDs - aElementIDs
		 * @param {string} bState - state
		 */
		enableElementsWithIDs: function (aElementIDs, bState) {
			var elementID, oElement;

			for (elementID in aElementIDs) {
				oElement = this.getView().byId(aElementIDs[elementID]);

				if (oElement) {
					oElement.setEnabled(bState);
				}
			}
		}

	});

});