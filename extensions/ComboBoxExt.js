/**
 * Helps in creating a ComboBoxExt, which will validate 
 * a proper value is given to the combobox or not.
 * 
 * @class
 * @public
 * @extends sap.m.ComboBox
 * @file com.amat.pse.prjordcrt.extensions.ComboBoxExt
 * @author Vimal Pandu
 * @since 27 July 2020
 * ------------------------------------------------------------------------------------ *
 * Date     	Author 					PCR No.      Description of change				*
 * ----------  	--------------------	---------    ---------------------------------- *
 * 07/27/2020  	Vimal Pandu				PCR030784    Initial Version					*
 * ------------------------------------------------------------------------------------ */

sap.ui.define([
	"sap/m/ComboBox",
	"sap/ui/core/ValueState"
], function(ComboBox, ValueState) {
	"use strict";

	return ComboBox.extend("com.amat.spg.labord.extensions.ComboBoxExt", {

		/**
		 * This method re-renders the given control.
		 * @name rerender
		 */
		renderer: {

		},

		/**
		 * This method helps in validating the given value is 
		 * present in the data bound to the element or not.
		 * @name onChange
		 * @param {Object} oCmbx - combobox reference
		 */
		onChange: function(oCmbx) {
			var aItemTexts = [];
			var sValueState, oItem, aItems, sValue;

			if (oCmbx) {
				if (!oCmbx.srcControl) {
					aItems = oCmbx.getItems();
					sValue = oCmbx.getValue();
				}
			} else {
				aItems = this.getItems();
				sValue = this.getValue();
			}

			for (oItem in aItems) {
				aItemTexts.push(aItems[oItem].getText());
			}

			if (!sValue) {
				sValueState = ValueState.None;
			} else {
				sValueState = (aItemTexts.indexOf(sValue.trim()) < 0) ? ValueState.Error : ValueState.None;
			}

			if (oCmbx) {
				if (!oCmbx.srcControl) {
					oCmbx.setValueState(sValueState);
				}
			} else {
				this.setValueState(sValueState);
			}
		},

		/**
		 * This method helps in creating the prototype of the given control.
		 * @name onAfterRendering
		 */
		onAfterRendering: function() {
			ComboBox.prototype.onAfterRendering.apply(this);
		}

	});

});