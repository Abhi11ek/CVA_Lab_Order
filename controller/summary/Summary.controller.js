/**
 * Summary controller helps in controlling the behaviour of all the view elements in the Summary View. 
 * 
 * @class
 * @public
 * @name com.amat.spg.labord.controller.Summary
 * @author Vimal Pandu
 * @since 27 July 2020
 * ------------------------------------------------------------------------------------ *
 * Date     	Author 					PCR No.      Description of change				*
 * ----------  	--------------------	---------    ---------------------------------- *
 * 07/27/2020  	Vimal Pandu				PCR030784    Initial Version					*
 * 10/12/2020  	Vimal Pandu				PCR032047    Phase - 2 changes					*
 * 02/10/2021  	Vimal Pandu				PCR033603    Chamber List changes				*
 * 03/11/2021   Vimal Pandu				PCR033677 	 Phase - 3 changes 					*
 * 05/19/2021   Nageswar V				PCR035112 	 Phase - 4 changes 					*
 * ------------------------------------------------------------------------------------ */

sap.ui.define([
	"../BaseController",
	"../../util/Constants",
	"../../util/Formatter",
	"../../util/IdHelper",
	"../../util/Util",
	"../../extensions/ComboBoxExt",
	"../../helper/FragmentHelper",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/Device"
], function (BaseController, Constants, Formatter, IDH, Util, ComboBoxExt, FragmentHelper, Filter, FilterOperator, Device) {
	"use strict";
	var that = this;

	return BaseController.extend("com.amat.spg.labord.controller.summary.Summary", {

		formatter: Formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the controller is instantiated. It sets up all the required event handling for the controller.
		 * @public
		 */
		onInit: function () {
			that = this;
			that._oFragment = new FragmentHelper(that);
			that._oResourceBundle = that.getResourceBundle();
			that._oUtil = new Util(that);
			that._oWorkOrderElements = {
				Input: [
					IDH.id.SERIALNO_INP,
					IDH.id.TITLE_INP,
					IDH.id.CREATION_DATE_INP,
					IDH.id.REQ_START_DATE_DTPKR,
					IDH.id.REQ_STRT_TM_PCKR, //PCR035112++
					IDH.id.WORK_DESC_TXTARA
				],
				ComboBox: [
					IDH.id.CHMB_TYP_CMBX,
					IDH.id.TOOL_STAT_CMBX,
					IDH.id.CATEGORY_CMBX,
					IDH.id.PRIORITY_CMBX,
					IDH.id.STATUS_CMBX,
					IDH.id.REASON_CMBX,
					IDH.id.MOC_CMBX,
					IDH.id.GSR_CMBX,
					IDH.id.ABATE_CMBX,
					IDH.id.CHEM_AUTH_CMBX,
					IDH.id.PASR_CMBX,
					IDH.id.FSR_CMBX,
					IDH.id.HOURS_CMBX, //PCR035112++
					IDH.id.MIN_CMBX //PCR035112++
				]
			};

			that._showFormFragment(Constants.PROP_VIEW_FRAG);
			that._onObjectMatched();

			sap.ui.getCore().getEventBus().subscribe(Constants.EVT_SUMMARY, Constants.PROP_DATA, function (channel, event, oEventData) {
				that._onObjectMatched();
			}, this);
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/** 
		 * Event handler for WO Summary icon tab bar select event
		 * @name onSelectSummaryIconTabBar
		 * @param {sap.ui.base.Event} oEvent - select event
		 */
		onSelectSummaryIconTabBar: function (oEvent) {
			var oIconTabBar = oEvent.getSource(),
				sSelKey = oIconTabBar.getSelectedKey();
			var oLabOrdModel = that.getComponent().getModel(Constants.MDL_LABORD);

			if (sSelKey !== "Details") {
				that.getRouter().getTargets().display(sSelKey);
				sap.ui.getCore().getEventBus().publish(Constants.TAB_SPGLABORD + sSelKey, Constants.PROP_DATA, {
					Tab: sSelKey
				});
			}

			var bShowFooter = (sSelKey === "Details" && oLabOrdModel.getProperty("/UpdateEvent"));
			sap.ui.controller(Constants.CONT_WODETAILS)._fnToggleFooterBar(bShowFooter);
		},

		/** 
		 * Event handler for Combobox selection change
		 * @name onComboBoxSelectionChange
		 * @param {sap.ui.base.Event} oEvent - select event
		 */
		onComboBoxSelectionChange: function (oEvent) {
			var oCmbx = oEvent.getSource();
			ComboBoxExt.prototype.onChange.call(this, oCmbx);
		},

		/** 
		 * Event handler for Pre Task Check List Combobox selection change
		 * @name onComboBoxSelectionChange
		 * @param {sap.ui.base.Event} oEvent - selection change event
		 */
		onPreTaskCmbxSelectionChange: function (oEvent) {
			var oCmbx = oEvent.getSource(),
				sSelKey = oCmbx.getSelectedKey(),
				aParentBox = oCmbx.getParent().getParent().getCells();
				// oText = aParentBox[0], //PCR032047--
				// oSwitch = aParentBox[1].getItems()[1]; //PCR032047--

			if (sSelKey === that._oResourceBundle.getText("noDataAvailable")) { //PCR032047--; removed && !oSwitch.getState()
				oCmbx.setSelectedKey("");
			}

			//Start of PCR032047++ changes

			/*if (sSelKey === that._oResourceBundle.getText("noDataAvailable") && oSwitch.getState()) {
				oSwitch.setState(false);
				BaseController.prototype.messageToast.call(that, oText.getText() + " " + that._oResourceBundle.getText("noDataAvailable"));
			}*/
 
			//End of PCR032047++ changes

			ComboBoxExt.prototype.onChange.call(this, oCmbx); //PCR032047++
		},

		/** 
		 * Event handler for Pre Task Check List switch change
		 * @name onPreTaskMandSwitchChange
		 * @param {sap.ui.base.Event} oEvent - change event
		 */
		onPreTaskMandSwitchChange: function (oEvent) {
			var oSwitch = oEvent.getSource(),
				aParentBox = oSwitch.getParent().getParent().getCells(),
				// oText = aParentBox[0], //PCR032047--
				oCmbx = aParentBox[2].getItems()[1],
				sSelKey = oCmbx.getSelectedKey();

			if (sSelKey === that._oResourceBundle.getText("noDataAvailable")) {
				//Start of PCR032047++ changes
				oCmbx.setSelectedKey("");
				/*oSwitch.setState(false);
				BaseController.prototype.messageToast.call(that, oText.getText() + " " + that._oResourceBundle.getText("noDataAvailable"));*/
				//End of PCR032047++ changes
			}
		},

		/** 
		 * Event handler for Work Status selection change
		 * @name onWorkStatusSelectionChange
		 * @param {sap.ui.base.Event} oEvent - selection change event
		 */
		onWorkStatusSelectionChange: function (oEvent) {
			var oCmbx = oEvent.getSource(),
				sSelKey = oCmbx.getSelectedKey();
			var oView = this.getView(),
				oReasonBox = oView.byId(IDH.id.REASON_BOX),
				oReasonCmbx = oView.byId(IDH.id.REASON_CMBX);
			var bDelayed = sSelKey === Constants.PROP_DELAYED;

			oReasonBox.setVisible(bDelayed);
			oReasonCmbx.setEditable(bDelayed || !sSelKey);
			oReasonCmbx.setSelectedKey(!bDelayed ? "" : oReasonCmbx.getSelectedKey());

			ComboBoxExt.prototype.onChange.call(this, oCmbx);
		},

		/** 
		 * Event handler for Work Order Edit button
		 * @name onPressEditWorkOrder
		 * @param {sap.ui.base.Event} oEvent - press event
		 */
		onPressEditWorkOrder: function (oEvent) {
			var oEditBtn = oEvent.getSource(),
				bEdit = oEditBtn.getText() === "Edit";
			var oViewModel = that.getView().getModel(Constants.MDL_SUMMARYVIEW),
				oLabOrdModel = that.getComponent().getModel(Constants.MDL_LABORD);

			that._showFormFragment(bEdit ? Constants.PROP_CRT_FRAG : Constants.PROP_VIEW_FRAG);

			var oView = that.getView(),
				oWorkDetailsGrid = oView.byId(IDH.id.WO_DET_GRID),
				oToolInformationGrid = oView.byId(IDH.id.TOOL_INFO_GRID);

			oViewModel.setProperty("/bShowEditBtn", !bEdit);
			oLabOrdModel.setProperty("/UpdateEvent", bEdit);

			if (bEdit) {
				jQuery.sap.delayedCall(1000, that, function () {
					that._fnSetValuesToElements();
				});
			} else {
				that._fnClearElements();
			}

			//Display Reason
			if (oWorkDetailsGrid.hasStyleClass(Constants.STYLE_HIDEREASON)) {
				oWorkDetailsGrid.removeStyleClass(Constants.STYLE_HIDEREASON);
			}

			//Display Tool Status
			if (!oToolInformationGrid.hasStyleClass(Constants.STYLE_HIDETOOL)) {
				oToolInformationGrid.removeStyleClass(Constants.STYLE_HIDETOOL);
			}

			sap.ui.controller(Constants.CONT_WODETAILS)._fnToggleFooterBar(bEdit);
		},

		/** 
		 * Event handler for Work Order Update button
		 * @name onPressUpdateWorkOrder
		 * @param {sap.ui.base.Event} oEvent - press event
		 */
		onPressUpdateWorkOrder: function (oEvent) {
			var oView = that.getView(),
				// oTable = oView.byId(IDH.id.PRETASK_CHECKLIST_TABLE),  PCR032047--
				oWorStatCmbx = oView.byId(IDH.id.STATUS_CMBX),
				// aItems = oTable.getItems(), PCR032047--
				bPreTaskValidData = true;
			var aCmbx = [
				IDH.id.CHMB_TYP_CMBX,
				IDH.id.CATEGORY_CMBX,
				IDH.id.STATUS_CMBX,
				IDH.id.HOURS_CMBX, //PCR035112++
				IDH.id.MIN_CMBX //PCR035112++
			];

			if (oWorStatCmbx.getSelectedKey() === Constants.PROP_DELAYED) {
				aCmbx.push(IDH.id.REASON_CMBX);
			}

			var bValidateInputs = that._oUtil.validateInputElements.call(that, [
					IDH.id.SERIALNO_INP,
					IDH.id.TITLE_INP,
					IDH.id.REQ_START_DATE_DTPKR,
					IDH.id.WORK_DESC_TXTARA
				]),
				bValidateComboboxes = that._oUtil.validateComboBoxElements.call(that, aCmbx);

			//Start of PCR032047-- changes	

			/*var oItem, aMand, aNumber;

			//Handle Pre Task Check List
			for (oItem in aItems) {
				aMand = aItems[oItem].getCells()[1].getItems();
				aNumber = aItems[oItem].getCells()[2].getItems();

				if (aMand[1].getState() && !aNumber[1].getSelectedKey()) {
					bPreTaskValidData = false;
					break;
				}
			}*/

			//End of PCR032047-- changes

			if (bValidateInputs && bValidateComboboxes.valid && bPreTaskValidData) {
				BaseController.prototype.handleWorkOrderCreation.call(that);
			} else {
				BaseController.prototype.messageToast.call(that, that._oResourceBundle.getText("provideAllDetailToContinue"));
			}
		},

		/**
		 * Event handler to close Dialog
		 * @name onDialogClose
		 */
		onDialogClose: function () {
			that._oFragment.destroyDialog.call(that);
		},

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		/**
		 * Binds the view to the object path and expands the aggregated line items.
		 * @name _onObjectMatched
		 * @private
		 */
		_onObjectMatched: function () {
			that._showFormFragment(Constants.PROP_VIEW_FRAG);

			BaseController.prototype.createViewModel.call(this, {
				sModelName: Constants.MDL_SUMMARYVIEW,
				busy: false,
				delay: 0,
				bShowEditBtn: true,
				sIconTabSelKey: "Details"
			});

			var oLabOrdModel = that.getComponent().getModel(Constants.MDL_LABORD);

			oLabOrdModel.setProperty("/GridDefaultSpan", "L4 M4 S6");
			oLabOrdModel.setProperty("/WorkDescSpan", "L12 M12 S12");
			oLabOrdModel.setProperty("/AttachmentsSpan", "L6 M6 S12");
			oLabOrdModel.setProperty("/CreateEvent", false);
			oLabOrdModel.setProperty("/UpdateEvent", false);
			oLabOrdModel.updateBindings();

			//Set Max Characters to Work Description
			var oWorkDescr = that.getView().byId(IDH.id.WORK_DESC_FEEDLISTITEM);

			if (oWorkDescr) {
				oWorkDescr.setMaxCharacters(Device.system.phone ? 80 : 480); //PCR032047++; changed 120 to 480

				jQuery.sap.delayedCall(500, that, function () {
					if (oWorkDescr._oLinkExpandCollapse && oWorkDescr._oLinkExpandCollapse.getProperty("text") === "LESS") {
						oWorkDescr._oLinkExpandCollapse.firePress();
					}
				});
			}
			
			// Start of PCR035112++ changes
			var oView = this.getView();
			var oRejRea = oView.byId(IDH.id.REJ_REA_FLI);
			
			if (oRejRea) {
				oRejRea.setMaxCharacters(Device.system.phone ? 80 : 480); 

				jQuery.sap.delayedCall(500, that, function () {
					if (oRejRea._oLinkExpandCollapse && oRejRea._oLinkExpandCollapse.getProperty("text") === Constants.PROP_LESS) {
						oRejRea._oLinkExpandCollapse.firePress();
					}
				});
			}
			// End of PCR035112++ changes
		},
		
		// Start of PCR035112++ changes
		
		/**
		 * Internal method to toggle Rejection Reason visibility
		 * @name _fnToggleRejectionReason
		 * @param {Object} oCntx - current view context
		 */
		_fnToggleRejectionReason: function (oCntx) {
			var oView = that.getView();
			var oViewGrid2 = oView.byId(IDH.id.VIEW_WO_GRID2);
			
			if (oCntx) {
				if (oCntx.WoStatusRejection.length > 0) {
					oViewGrid2.removeStyleClass(Constants.STYLE_REJ_REA_HIDE);
					oViewGrid2.addStyleClass(Constants.STYLE_REJ_REA_SHOW);
				} else {
					oViewGrid2.removeStyleClass(Constants.STYLE_REJ_REA_SHOW);
					oViewGrid2.addStyleClass(Constants.STYLE_REJ_REA_HIDE);
				}
			}
		},
		
		// End of PCR035112++ changes

		/**
		 * Internal method to insert Read/Edit fragment
		 * @name _showFormFragment
		 * @param {string} sFragmentName - fragment reference
		 */
		_showFormFragment: function (sFragmentName) {
			var oVLayout = that.byId(IDH.id.WO_DET_LAYOUT);

			if (oVLayout) {
				oVLayout.removeAllContent();
				oVLayout.insertContent(that._getFormFragment(sFragmentName));
			}
		},

		/**
		 * Internal method to create Read/Edit fragment
		 * @name _formFragments
		 */
		_formFragments: {},

		/**
		 * Property which holds Work Order Attachments
		 * @name _formFragments
		 */
		_workOrderAttachments: {},

		/**
		 * Internal method to display Read/Edit fragment
		 * @name _getFormFragment
		 * @param {string} sFragmentName - fragment reference
		 * @returns {Object} Fragment reference
		 */
		_getFormFragment: function (sFragmentName) {
			var oFormFragment = that._formFragments[sFragmentName];

			if (oFormFragment) {
				return oFormFragment;
			}

			oFormFragment = sap.ui.xmlfragment(
				that.getView().getId(),
				Constants.FRAG_SUMM + sFragmentName,
				that
			);

			that._formFragments[sFragmentName] = oFormFragment;
			return that._formFragments[sFragmentName];
		},

		/** 
		 * Internal method to clear all the values/selections/state 
		 * of Work Order edit elements
		 * @name _fnClearElements
		 */
		_fnClearElements: function () {
			var oLabOrdModel = that.getComponent().getModel(Constants.MDL_LABORD);

			//Clear Tool Context
			oLabOrdModel.setProperty("/oToolId", {});

			var aElements = that._oWorkOrderElements.Input.concat(that._oWorkOrderElements.ComboBox);

			//Clear Elements State
			that._oUtil.setValueStateForElementsWithIDs.call(that, aElements, "None");

			//Clear Inputs
			that._oUtil.clearElementsWithIDs.call(that, aElements);

			//Clear Comboboxes
			that._oUtil.clearSelectedItemInComboBox.call(that, that._oWorkOrderElements.ComboBox);
		},

		/** 
		 * Internal method to set all the values/selections/state 
		 * of Work Order edit elements
		 * @name _fnSetValuesToElements
		 */
		_fnSetValuesToElements: function () {
			var oLabOrdModel = that.getComponent().getModel(Constants.MDL_LABORD),
				oCntx = oLabOrdModel.getProperty("/WOCntx");
			var oView = that.getView(),
				oTable = oView.byId(IDH.id.PRETASK_CHECKLIST_TABLE),
				oReqStartDate = oView.byId(IDH.id.REQ_START_DATE_DTPKR),
				aItems = oTable.getItems();
			var oItem, aMand, aNumber, sAbatement, oDate;

			//Format Dates
			var sCreationDate = Formatter.dateFormat(oCntx.CreationDatetime);
			var sRequestedDate = oCntx.Startdatetime.slice(0, 4) + "-" + oCntx.Startdatetime.slice(4, 6) + "-" + oCntx.Startdatetime.slice(6, 8);
			 
			//Start of PCR033677++ changes
			var oReqDate = new Date(
				parseInt(oCntx.Startdatetime.slice(0, 4), 10),
				parseInt(oCntx.Startdatetime.slice(4, 6), 10) - 1,
				parseInt(oCntx.Startdatetime.slice(6, 8), 10),
				parseInt(oCntx.Startdatetime.slice(8, 10), 10),
				parseInt(oCntx.Startdatetime.slice(10, 12), 10),
				parseInt(oCntx.Startdatetime.slice(12, 14), 10),
				parseInt("00", 10)
			);
			
			//End of PCR033677++ changes

			//Set Tool Context
			oLabOrdModel.setProperty("/oToolId", oCntx);
			oLabOrdModel.setProperty("/RequestedbyName", oCntx.RequestedbyName);

			//Get Chamber Type Values
			that._fnFilterChamberType(oCntx); //PCR032047--; changed Equipment to  oCntx

			//Start of PCR032047++ changes

			//Disable Pbg Input in create event
			oView.byId(IDH.id.PBG_CMBX).setEditable(false);

			//Disable Tool Name Combobox in edit mode
			oView.byId(IDH.id.TOOL_NAME_INP).setEnabled(false);

			oView.byId(IDH.id.PBG_CMBX).setValue(oCntx.Pbg);
			oView.byId(IDH.id.TOOL_NAME_INP).setValue(oCntx.Equipmentdescription);

			//End of PCR032047++ changes

			//Disable Tool Id Input in update event
			oView.byId(IDH.id.SERIALNO_INP).setEditable(false);
			oView.byId(IDH.id.SERIALNO_INP).setValue(oCntx.Serialnumber);
			oView.byId(IDH.id.TITLE_INP).setValue(oCntx.Projname);
			oView.byId(IDH.id.WORK_DESC_TXTARA).setValue(oCntx.Problemdescription);
			oView.byId(IDH.id.CREATION_DATE_INP).setValue(sCreationDate);
			
			//Start of PCR033677++ changes
			
			jQuery.sap.delayedCall(1500, that, function () {
				$('input[id*="idReqStartDate-inner').attr('disabled', true);
			});
			
			//End of PCR033677++ changes

			oView.byId(IDH.id.CHMB_TYP_CMBX).setSelectedKey(oCntx.Assembly);
			oView.byId(IDH.id.TOOL_STAT_CMBX).setSelectedKey(oCntx.Toolstatus);
			oView.byId(IDH.id.CATEGORY_CMBX).setSelectedKey(oCntx.Category2);
			oView.byId(IDH.id.PRIORITY_CMBX).setSelectedKey(oCntx.Priority);
			oView.byId(IDH.id.STATUS_CMBX).setSelectedKey(oCntx.WorkStatus);
			oView.byId(IDH.id.REASON_CMBX).setSelectedKey(oCntx.Delay);

			//To display Reason, when status is delayed
			oView.byId(IDH.id.STATUS_CMBX).fireSelectionChange();

			//Set requested start date as current date
			if (sRequestedDate) {
				// oDate = new Date(sRequestedDate); PCR033677--
				oDate = oReqDate; //PCR033677++
			} else {
				oDate = new Date();
			}
			
			//Start of PCR035112++ changes
			
			oView.byId(IDH.id.HOURS_CMBX).setSelectedKey(oCntx.Startdatetime.slice(8, 10));
			
			var sMin = oCntx.Startdatetime.slice(10, 12),
				iMin = parseInt(sMin, 10);
			
			if (!iMin) {
				sMin = "00";
			} else if (iMin > 0 && iMin <= 15) {
				sMin = "15";
			} else if (iMin > 15 && iMin <= 30) {
				sMin = "30";
			} else if (iMin > 30 && iMin <= 59) {
				sMin = "45";
			}
			
			oView.byId(IDH.id.MIN_CMBX).setSelectedKey(sMin);
			
			//End of PCR035112++ changes
			
			oReqStartDate.setDateValue(oReqDate); //PCR033677++
			oReqStartDate.setMinDate(oReqDate);//PCR033677++
			// oReqStartDate.setMinDate(new Date(oDate.setDate(oDate.getDate() - 1))); //PCR033677--
			// oReqStartDate.setDateValue(new Date(sRequestedDate)); PCR033677--
			

			//Refresh Combobox bindings
			that._fnRefreshItemBindings();

			//Handle Pre Task Check List
			for (oItem in aItems) {
				aMand = aItems[oItem].getCells()[1].getItems();
				aMand[1].setState(aMand[0].getTitle().toUpperCase() === Constants.PROP_YES);
				aNumber = aItems[oItem].getCells()[2].getItems();

				if (aItems[oItem].getCells()[0].getText() === "Abatement") {
					sAbatement = oLabOrdModel.getProperty("/PreTaskCheckList/Abatement/Number");
					aNumber[1].setSelectedKey(sAbatement === "-" ? "" : sAbatement);
				} else {
					aNumber[1].setSelectedKey(aNumber[0].getText() === "-" ? "" : aNumber[0].getText());
				}
			}

			//Clear Attachments 
			this._workOrderAttachments.files = [];
		},

		/** 
		 * Internal method to get Chamber Type dropdown values
		 * based on equipment
		 * @name _fnFilterChamberType
		 * @param {oCntx} oCntx - Current Context
		 */
		_fnFilterChamberType: function (oCntx) {
			var oView = that.getView(),
				oChamCmbx = oView.byId(IDH.id.CHMBTYP_CMBX);
			
			//Start of PCR032047++ changes
			
			/*oChamCmbx.getBinding(Constants.PROP_ITEMS).filter([
				new Filter(Constants.FIL_PROCESS_TYP, FilterOperator.EQ, "ZCMO"),
				new Filter(Constants.FIL_EQUIPMENT, FilterOperator.EQ, oCntx.Serialnumber)
			]);*/
			
			that._oCntx = oCntx;
			oChamCmbx.setBusy(true);

			var oPromise = new Promise(function (resolve, reject) {
				oChamCmbx.getBinding(Constants.PROP_ITEMS).filter([
					// Start of PCR033603++ changes
					// new Filter(Constants.FIL_CUSTTOOL_ID, FilterOperator.EQ, oCntx.Serialnumber)
					new Filter(Constants.FIL_PROCESS_TYP, FilterOperator.EQ, "ZCMO"),
					new Filter(Constants.FIL_EQUIPMENT, FilterOperator.EQ, oCntx.Equipment)
					// End of PCR033603++ changes
				]);
				oChamCmbx.getBinding(Constants.PROP_ITEMS).attachEvent(Constants.EM_DATA_RCVD, function (oEvent) {
					oChamCmbx.setBusy(false);
					oChamCmbx.setBusyIndicatorDelay(0);
					
					if (oEvent.getParameter(Constants.PROP_DATA) && oEvent.getParameter(Constants.PROP_DATA).results.length) {
						resolve(oChamCmbx.getItems())
					}

				});
			});

			oPromise.then(function (aItems) {
				var oCmbx = that.getView().byId(IDH.id.CHMBTYP_CMBX);
				var oItem;
				
				for (oItem in aItems) {
					if (aItems[oItem].getBindingContext().getObject().AssemblyDesc.toUpperCase() === that._oCntx.Assembly.toUpperCase()) {
						oCmbx.setSelectedItem(aItems[oItem]);
					}
				}
			});

			/*BaseController.prototype.validateDataReceived.call(
			 	that, IDH.id.CHMBTYP_CMBX, Constants.PROP_ITEMS
			);*/
			
			//End of PCR032047++ changes
		},

		/** 
		 * Internal method to refresh the bindings of all the 
		 * Comboboxes in Work Order Edit view
		 * @name _fnRefreshItemBindings
		 */
		_fnRefreshItemBindings: function () {
			var oView = that.getView();

			BaseController.prototype.validateDataReceived.call(
				that, IDH.id.TOOL_STAT_CMBX, Constants.PROP_ITEMS
			);

			oView.byId(IDH.id.TOOL_STAT_CMBX).getBinding(Constants.PROP_ITEMS).refresh();

			BaseController.prototype.validateDataReceived.call(
				that, IDH.id.CATEGORY_CMBX, Constants.PROP_ITEMS
			);

			oView.byId(IDH.id.CATEGORY_CMBX).getBinding(Constants.PROP_ITEMS).refresh();

			BaseController.prototype.validateDataReceived.call(
				that, IDH.id.PRIORITY_CMBX, Constants.PROP_ITEMS
			);

			oView.byId(IDH.id.PRIORITY_CMBX).getBinding(Constants.PROP_ITEMS).refresh();

			BaseController.prototype.validateDataReceived.call(
				that, IDH.id.STATUS_CMBX, Constants.PROP_ITEMS
			);

			oView.byId(IDH.id.STATUS_CMBX).getBinding(Constants.PROP_ITEMS).refresh();

			BaseController.prototype.validateDataReceived.call(
				that, IDH.id.REASON_CMBX, Constants.PROP_ITEMS
			);

			oView.byId(IDH.id.REASON_CMBX).getBinding(Constants.PROP_ITEMS).refresh();
		},

		//Start of PCR032047++ changes

		/** 
		 * Internal method to style check list items table
		 * @name _fnValidateChecklistItems
		 */
		_fnValidateChecklistItems: function () {
			var oPTCTable = that.getView().byId(IDH.id.PRETASK_CHECKLIST_TABLE);
			var aItems = oPTCTable.getItems();
			var aCells, sMan, sNum;

			for (var oItem in aItems) {
				aCells = aItems[oItem].getCells();
				sMan = aCells[1].getItems()[0].getTitle();
				sNum = aCells[2].getItems()[0].getText();

				aItems[oItem].removeStyleClass("spgLabOrdPretaskCheckListRow");
				aItems[oItem].removeStyleClass("spgLabOrdPretaskCheckListErrRow");

				if (sMan.toUpperCase() === Constants.PROP_YES && !sNum.length) {
					aItems[oItem].addStyleClass("spgLabOrdPretaskCheckListErrRow");
				} else {
					aItems[oItem].addStyleClass("spgLabOrdPretaskCheckListRow");
				}
			}
		}

		//End of PCR032047++ changes

	});

});