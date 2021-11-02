/**
 * Attachments controller helps in controlling the behaviour of all the view elements in the Attachments View.
 * 
 * @class
 * @public
 * @name com.amat.spg.labord.controller.PartsRequired
 * @author Vimal Pandu
 * @since 27 July 2020
 * ------------------------------------------------------------------------------------ *
 * Date     	Author 					PCR No.      Description of change				*
 * ----------  	--------------------	---------    ---------------------------------- *
 * 07/27/2020  	Vimal Pandu				PCR030784    Initial Version					*
 * 10/12/2020  	Vimal Pandu				PCR032047    Phase - 2 changes					*
 * 03/11/2021   Vimal Pandu				PCR033677 	 Phase - 3 changes 					*
 * 05/19/2021   Nageswar V				PCR035112 	 Phase - 4 changes 					*
 * ------------------------------------------------------------------------------------ */

sap.ui.define([
	"../BaseController",
	"../../libs/jszip",
	"../../libs/xlsx",
	"../../util/Constants",
	"../../util/EventTriggers",
	"../../util/Formatter",
	"../../util/IdHelper",
	"../../util/ServiceConfigConstants",
	"../../util/Util",
	"../../helper/FragmentHelper",
	"../../model/ModelObjects",
	"sap/ui/Device",
	"sap/m/Button"
], function (BaseController, jszip, xlsx, Constants, EventTriggers, Formatter, IDH, ServiceConfigConstants, Util, FragmentHelper,
	ModelObj, Device, Button) {
	"use strict";
	var that = this;

	return BaseController.extend("com.amat.spg.labord.controller.summary.PartsRequired", {

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
			that._onObjectMatched();
			that._oTable = that.getView().byId(IDH.id.PARTS_REQ_TABLE);
			that._oAddPartsTable = that.getView().byId(IDH.id.ADD_PARTS_TABLE);

			sap.ui.getCore().getEventBus().subscribe(Constants.EVT_PARTSREQ, Constants.PROP_DATA, function (channel, event, oEventData) {
				that._onObjectMatched();
			}, this);
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/** 
		 * Event handler to download parts template.
		 * @name onPressDownloadSpreadsheet
		 */
		onPressDownloadSpreadsheet: function () {
			var aPartsTemplate = [{
				"Part #": "",
				"NSO (Y/N)": "",
				"Serialized (Y/N)": "",
				"Qty Required": "",
				"Qty Supplied": "",
				"Serial Number": ""
			}];

			var oWorkSheet = XLSX.utils.json_to_sheet(aPartsTemplate);
			var oWorkBook = XLSX.utils.book_new();

			XLSX.utils.book_append_sheet(oWorkBook, oWorkSheet, Constants.PROP_PARTS_FILENAME);
			var sFileName = Constants.PROP_PARTS_TEMPLATE;
			XLSX.writeFile(oWorkBook, sFileName);
		},

		/** 
		 * Event handler to toggle availability of table header buttons.
		 * @name onPartsTableselect
		 * @param {sap.ui.base.Event} oEvent - select event
		 */
		onPartsTableselect: function (oEvent) {
			var bSelected = oEvent.getSource().getSelected();
			that._oTable._getSelectAllCheckbox().setSelected(bSelected);
			that._oTable._getSelectAllCheckbox().fireSelect();

			if (that._oAddPartsTable.getVisible()) {
				if (bSelected) {
					that._oAddPartsTable.selectAll();
				} else {
					that._oAddPartsTable.removeSelections();
				}
			}
		},

		/** 
		 * Event handler to toggle availability of table header buttons.
		 * @name onSelectParts
		 * @param {sap.ui.base.Event} oEvent - selection change event
		 */
		onSelectParts: function (oEvent) {
			var oViewModel = that.getModel(Constants.MDL_PARTSREQVIEW),
				bTableEditMode = oViewModel.getProperty("/bTableEditMode"),
				aParts = oViewModel.getProperty("/aParts");
			var aSelItems = that._oTable.getSelectedItems();

			if (!bTableEditMode && aSelItems.length && aParts.length) {
				that._oTable.removeSelections();
				that.getView().byId(IDH.id.PARTS_REQ_HEADER_CKBX).setSelected(false);
				BaseController.prototype.messageToast.call(that, that._oResourceBundle.getText("cannotSelectPartInReadMode"));
				return;
			}

			if (aParts.length === 1) {
				that._fnAddHeaderButtons(Constants.CUSTEVT_ADD);
			} else if (!aParts.length && !aSelItems.length) {
				that._fnAddHeaderButtons(Constants.CUSTEVT_INIT);
			} else if (aSelItems.length && !aParts.length) {
				that._fnAddHeaderButtons(Constants.CUSTEVT_SELECT);
			} else if (aParts.length > 1) {
				that._fnAddHeaderButtons(Constants.CUSTEVT_UPLOAD);
			}
		},

		/** 
		 * Event handler to edit parts table.
		 * @name onPressEditParts
		 */
		onPressEditParts: function () {
			var aSelItems = that._oTable.getSelectedItems();
			var oViewModel = that.getModel(Constants.MDL_PARTSREQVIEW);

			if (aSelItems.length) {
				that._fnAddHeaderButtons(Constants.CUSTEVT_EDIT);
				that._fnSetTableinEditMode(true);
				oViewModel.setProperty("/bTableEditMode", true);
			} else {
				BaseController.prototype.messageToast.call(that, that._oResourceBundle.getText("selectPartsToContinue"));
			}
		},

		/** 
		 * Event handler to validate nso/serialized/quantity fields
		 * @name onChangeNsoSerialised
		 * @param {sap.ui.base.Event} oEvent - change event
		 */
		onChangeNsoSerialised: function (oEvent) {
			var oRow = oEvent.getSource().getParent().getParent(),
				aCells = oRow.getCells();
			var oNsoSwitch = aCells[2].getItems()[1],
				oSerialisedSwitch = aCells[3].getItems()[1],
				oReqInp = aCells[4].getItems()[1],
				oSupQty = aCells[5].getItems()[1],
				oSerialInp = aCells[6].getItems()[1];

			if (oNsoSwitch.getState() && oSerialisedSwitch.getState() || (oSerialisedSwitch.getState())) {
				oReqInp.setValue("1");
				oReqInp.setEnabled(false);
				oSerialInp.setVisible(true);
				oSerialInp.setEnabled(true);
			} else if (oNsoSwitch.getState() || (!oNsoSwitch.getState() && !oSerialisedSwitch.getState())) {
				oReqInp.setValue(aCells[4].getItems()[0].getText());
				oReqInp.setEnabled(true);
				oSerialInp.setVisible(false);
				oSerialInp.setEnabled(false);
			}

			oSupQty.setEnabled(false);

			//To set Qty Required to Qty Supplied
			oReqInp.fireLiveChange();
		},

		/** 
		 * Event handler to validate nso/serialized/quantity fields
		 * @name onChangeNsoSerialised
		 * @param {sap.ui.base.Event} oEvent - change event
		 */
		onChangeQuantityRequired: function (oEvent) {
			var oQtyReqInp = oEvent.getSource(),
				aCells = oQtyReqInp.getParent().getParent().getCells(),
				oQtySupplied = aCells[5].getItems()[1];

			oQtySupplied.setValue(oQtyReqInp.getValue());
			oQtySupplied.fireLiveChange(); //PCR032047++  
			oQtyReqInp.setValueState(!oQtyReqInp.getValue() ? sap.ui.core.ValueState.Error : sap.ui.core.ValueState.None); //PCR032047++  
		},

		/** 
		 * Event handler to delete the parts from work order
		 * @name onPressDeletePart
		 * @param {sap.ui.base.Event} oEvent - press event 
		 */
		onPressDeletePart: function (oEvent) {
			var aSelItems = that._oTable.getSelectedItems();
			var oLabOrdModel = that.getComponent().getModel(Constants.MDL_LABORD),
				oCntx = oLabOrdModel.getProperty("/WOCntx");
			var oAddPartEvt = new ModelObj(Constants.MOBJ_OEVENT);
			var aParts = [];
			var oDeletePartsPayload = {
				Servicecasenumber: oCntx.Servicecasenumber,
				ErrorMessage: "",
				ToParts: aParts
			};
			var oItem, oPart, oDelPart;

			if (aSelItems.length) {
				for (oItem in aSelItems) {
					oPart = aSelItems[oItem].getBindingContext().getObject();

					oDelPart = jQuery.extend({}, {
						Servicecasenumber: oPart.Servicecasenumber,
						ItemNumber: oPart.ItemNumber
					});

					aParts.push(oDelPart);
				}

				oDeletePartsPayload.ToParts = aParts;

				that._oFragment.openBusyDialogExt.call(that, that._oResourceBundle.getText("busyDialogMsg"));

				oAddPartEvt.sEventType = Constants.POST;
				oAddPartEvt.sEvent = EventTriggers.TRIGGER_PARTS_DELETE;
				oAddPartEvt.sEventSuccss = EventTriggers.DELETE_PARTS_SUCCESS;
				oAddPartEvt.sEventError = EventTriggers.DELETE_PARTS_FAIL;
				oAddPartEvt.sPostEntitySetPath = ServiceConfigConstants.partsDeleteSet;
				oAddPartEvt.oPayload = oDeletePartsPayload;
				oAddPartEvt.sSuccessHandler = "handlePartsUpdationSuccess";
				oAddPartEvt.sErrorHandler = "handleRequestFail";

				that.finishoDataModelregistartionProcessWithParams.call(that, oAddPartEvt);
			} else {
				BaseController.prototype.messageToast.call(that, that._oResourceBundle.getText("selectPartsToContinue"));
			}
		},

		/** 
		 * Event handler to import parts from the template to Add Parts Table
		 * @name onPressImportRequiredParts
		 * @param {sap.ui.base.Event} oEvent - press event
		 */
		onPressImportRequiredParts: function (oEvent) {
			var oFile = oEvent.getParameter("files")[0];
			that._aParts = [];

			if (oFile && window.FileReader) {
				var reader = new FileReader();

				try {
					reader.onload = function (e) {
						var data = e.target.result;
						var excelsheet = XLSX.read(data, {
							type: "binary"
						});
						excelsheet.SheetNames.forEach(function (sheetName) {
							//this is the required data in Object format
							var aExcelRow = XLSX.utils.sheet_to_row_object_array(excelsheet.Sheets[sheetName]);
							var oViewModel = that.getModel(Constants.MDL_PARTSREQVIEW),
								aNewParts = [],
								oNewPart = {};
							var oLabOrdModel = that.getComponent().getModel(Constants.MDL_LABORD),
								oCntx = oLabOrdModel.getProperty("/WOCntx");
							var oView = that.getView(),
								oScrollCont = oView.byId(IDH.id.PARTS_SCROLL_CONT),
								oAddPartsTable = that._oAddPartsTable;

							that._aParts = oViewModel.getProperty("/aParts");

							for (var oItem in aExcelRow) {
								if (aExcelRow[oItem][Constants.TABCOL_PARTNO]) {
									oNewPart.Servicecasenumber = oCntx.Servicecasenumber;
									oNewPart.PartNumber = aExcelRow[oItem][Constants.TABCOL_PARTNO].toString();
									oNewPart.Description = "";
									oNewPart.NsoFlag = aExcelRow[oItem][Constants.TABCOL_NSO] ?
										aExcelRow[oItem][Constants.TABCOL_NSO].toString().toUpperCase() : "";
									oNewPart.SerializedFlag = aExcelRow[oItem][Constants.TABCOL_SERIALIZED] ?
										aExcelRow[oItem][Constants.TABCOL_SERIALIZED].toString().toUpperCase() : "";
									oNewPart.SerialNumber = aExcelRow[oItem][Constants.TABCOL_SERIALNO] ?
										aExcelRow[oItem][Constants.TABCOL_SERIALNO].toString() : "";
									oNewPart.QuantitySupplied = aExcelRow[oItem][Constants.TABCOL_QTYSUP] ?
										Formatter.formatQuantity(aExcelRow[oItem][Constants.TABCOL_QTYSUP].toString()) : "0";
									oNewPart.QuantityRequired = aExcelRow[oItem][Constants.TABCOL_QTYREQ] ?
										Formatter.formatQuantity(aExcelRow[oItem][Constants.TABCOL_QTYREQ].toString()) : "0";

									aNewParts.push(jQuery.extend({}, oNewPart));
								}
							}

							if (!aNewParts.length) {
								BaseController.prototype.messageToast.call(that, that._oResourceBundle.getText("partsImportErrorMessage"));
							} else {
								that._aParts = that._aParts.map(function (oPart) {
									delete oPart.bActions;
									return oPart;
								});

								that._aParts = that._aParts.concat(aNewParts);

								oViewModel.setProperty("/aParts", that._aParts);
								oViewModel.setProperty("/bAddPartEvt", false);
								oViewModel.refresh();

								that._fnShowNoDataText(that._aParts.length > 0 ? false : true);
								that._fnAddHeaderButtons(Constants.CUSTEVT_UPLOAD);
								that._fnToggleTableVisibility();

								jQuery.sap.delayedCall(500, that, function () {
									oScrollCont.scrollToElement(oAddPartsTable);
								});
							}
						});

						if (that._aParts.length) {
							that._fnValidateParts(that._aParts);
						}
					};
				} catch (e) {
					BaseController.prototype.messageToast.call(that, that._oResourceBundle.getText("partsImportErrorMessage"));
				}
				reader.readAsBinaryString(oFile);
			}
		},

		/** 
		 * Event handler to validate imported file to Add Parts Table
		 * @name onFileTypeMissmatch
		 * @param {sap.ui.base.Event} oEvent - change event
		 */
		onFileTypeMissmatch: function (oEvent) {
			var sType = oEvent.getParameter("fileType");

			if (sType !== "xls" || sType !== "xlsx") {
				BaseController.prototype.messageToast.call(that, that._oResourceBundle.getText("partsImportFileTypeErrorMessage"));
			}
		},

		/** 
		 * Event handler to validate if the selected part has any errors
		 * @name onAddPartTableSelectionChange
		 * @param {sap.ui.base.Event} oEvent - selection change event
		 */
		onAddPartTableSelectionChange: function (oEvent) {
			var oTable = oEvent.getSource(),
				oSelItem = oTable.getSelectedItem();

			if (oSelItem) {
				var oPart = oSelItem.getBindingContext(Constants.MDL_PARTSREQVIEW).getObject();

				if (oPart.ErrorMessage) {
					oSelItem.setSelected(false);
					BaseController.prototype.messageToast.call(that, that._oResourceBundle.getText("selectValidPartsErrorMessage"));
				}
			}

			that._oTable.fireSelectionChange();
		},

		/** 
		 * Event handler to add parts to Add Parts Table
		 * @name onPressAddRequiredPart
		 */
		onPressAddRequiredPart: function () {
			var oView = that.getView(),
				oScrollCont = oView.byId(IDH.id.PARTS_SCROLL_CONT),
				oAddPartsTable = that._oAddPartsTable;
			var oLabOrdModel = that.getComponent().getModel(Constants.MDL_LABORD),
				oCntx = oLabOrdModel.getProperty("/WOCntx");
			var oViewModel = that.getModel(Constants.MDL_PARTSREQVIEW),
				aParts = oViewModel.getProperty("/aParts");
			var oPart = new ModelObj(Constants.MOBJ_ADDPART);

			if (!oViewModel.getProperty("/aParts").length) {
				that._oAddPartsTable.removeSelections();
			}

			oPart.bActions = true;
			oPart.Servicecasenumber = oCntx.Servicecasenumber;
			aParts = aParts.concat([oPart]);

			oViewModel.setProperty("/bAddPartEvt", true);
			oViewModel.setProperty("/aParts", aParts);
			oViewModel.refresh();
			that._fnAddHeaderButtons(Constants.CUSTEVT_ADD);
			that._fnShowNoDataText(false);
			that._fnToggleTableVisibility();

			jQuery.sap.delayedCall(500, that, function () {
				oScrollCont.scrollToElement(oAddPartsTable);
			});
		},

		/** 
		 * Event handler to validate nso/serialized/quantity fields
		 * @name onAddNsoSerialisedChange
		 * @param {sap.ui.base.Event} oEvent - change event
		 */
		onAddNsoSerialisedChange: function (oEvent) {
			var oSwitch = oEvent.getSource(),
				oCntx = oSwitch.getBindingContext(Constants.MDL_PARTSREQVIEW).getObject(),
				oRow = oSwitch.getParent(),
				aCells = oRow.getCells();
			var oNsoSwitch = aCells[2],
				oSerialisedSwitch = aCells[3],
				oReqInp = aCells[4],
				oSupQty = aCells[5],
				oSerialInp = aCells[6];

			oCntx[oSwitch.getBindingInfo("state").parts[0].path] = oSwitch.getState() ? Constants.PROP_YES : Constants.PROP_NO;

			if (oNsoSwitch.getState() && oSerialisedSwitch.getState() || (oSerialisedSwitch.getState())) {
				oReqInp.setValue("1");
				oReqInp.setEnabled(false);
				oSerialInp.setVisible(true);
				oSerialInp.setEnabled(true);
			} else if (oNsoSwitch.getState() || (!oNsoSwitch.getState() && !oSerialisedSwitch.getState())) {
				oReqInp.setValue(oReqInp.getValue() ? oReqInp.getValue() : "");
				oReqInp.setEnabled(true);
				oSerialInp.setVisible(false);
				oSerialInp.setEnabled(false);
				oSerialInp.setValue("");
			}

			oSupQty.setEnabled(false);

			//To set Qty Required to Qty Supplied
			oReqInp.fireLiveChange();
		},

		/** 
		 * Event handler to validate nso/serialized/quantity fields
		 * @name onAddQuantityRequiredChange
		 * @param {sap.ui.base.Event} oEvent - change event
		 */
		onAddQuantityRequiredChange: function (oEvent) {
			var oQtyReqInp = oEvent.getSource(),
				aCells = oQtyReqInp.getParent().getCells(),
				oQtySupplied = aCells[5];

			oQtySupplied.setValue(oQtyReqInp.getValue());
			oQtySupplied.fireLiveChange(); //PCR032047++  
			oQtyReqInp.setValueState(!oQtyReqInp.getValue() ? sap.ui.core.ValueState.Error : sap.ui.core.ValueState.None); //PCR032047++     
		},
		
		/** 
		 * Event handler to delete part from Add Parts Table
		 * @name onPressRemoveNewPart
		 * @param {sap.ui.base.Event} oEvent - press event
		 */
		onPressRemoveNewPart: function (oEvent) {
			var oViewModel = that.getModel(Constants.MDL_PARTSREQVIEW);
			var oRow = oEvent.getSource(),
				sPath = oRow.getBindingContext(Constants.MDL_PARTSREQVIEW).getPath(),
				aPath = sPath.split("/"),
				sIndex = aPath[aPath.length - 1];

			oRow.getParent().getParent().setSelected(false);
			oViewModel.getProperty("/aParts").splice(sIndex, 1);
			oViewModel.refresh();
			that._fnShowNoDataText(oViewModel.getProperty("/aParts").length ? false : true);
			that._fnToggleTableVisibility();

			if (!oViewModel.getProperty("/aParts").length) {
				that._oAddPartsTable.removeSelections();
				that.onPressCancelEditPart();
			}

			if (!oViewModel.getProperty("/aParts").length && !that._oTable.getItems().length) {
				that._fnAddHeaderButtons(Constants.CUSTEVT_INIT);
			}
		},

		/** 
		 * Event handler to validate given part number in Add Parts Table
		 * @name onChangePartNumber
		 * @param {sap.ui.base.Event} oEvent - change event
		 */
		onChangePartNumber: function (oEvent) {
			var oInput = oEvent.getSource(),
				sPartNo = oInput.getValue();
			var oViewModel = that.getModel(Constants.MDL_PARTSREQVIEW),
				aParts = oViewModel.getProperty("/aParts");
			var oLabOrdModel = that.getComponent().getModel(Constants.MDL_LABORD),
				oCntx = oLabOrdModel.getProperty("/WOCntx");
			var oPart = new ModelObj(Constants.MOBJ_ADDPART);

			oPart.Servicecasenumber = oCntx.Servicecasenumber;
			oPart.PartNumber = sPartNo;
			oPart.ItemNumber = "0";

			if (aParts.length === 1 && sPartNo) {
				that._fnValidateParts([oPart]);
			}
		},

		/** 
		 * Event handler to parts to Work Order
		 * @name onPressUpdateParts
		 */
		onPressUpdateParts: function () {
			var oLabOrdModel = that.getComponent().getModel(Constants.MDL_LABORD),
				oCntx = oLabOrdModel.getProperty("/WOCntx");
			var oViewModel = that.getModel(Constants.MDL_PARTSREQVIEW),
				aParts = oViewModel.getProperty("/aParts");
			var oAddPartEvt = new ModelObj(Constants.MOBJ_OEVENT);
			var oAddPartsPayload, oPart, bValidParts = true;

			if (aParts.length) {
				aParts = aParts.map(function (oPartItem) {
					delete oPartItem.bActions;
					oPartItem.ItemNumber = oPartItem.ItemNumber ? oPartItem.ItemNumber : "0";
					oPartItem.NsoFlag = (oPartItem.NsoFlag === "Y" || oPartItem.NsoFlag === Constants.PROP_YES) ? Constants.PROP_YES : Constants.PROP_NO;
					oPartItem.SerializedFlag = (oPartItem.SerializedFlag === "Y" || oPartItem.SerializedFlag === Constants.PROP_YES) ? Constants.PROP_YES :
						Constants.PROP_NO;
					return oPartItem;
				});
			} else {
				aParts = that._fnGetPartItems();
			}

			for (oPart in aParts) {
				if (!aParts[oPart].PartNumber) {
					bValidParts = false;
				} else if (aParts[oPart].PartNumber && (!aParts[oPart].QuantityRequired || !aParts[oPart].QuantitySupplied)) {
					bValidParts = false;
				//Start of PCR032047++ changes	
				} else if (aParts[oPart].PartNumber && (aParts[oPart].SerializedFlag === Constants.PROP_YES && !aParts[oPart].SerialNumber)) {
					bValidParts = false;
				}
				//End of PCR032047++ changes
			}
			
			that._fnValidateMandatoryColumns(); //PCR032047++

			if (!bValidParts) {
				BaseController.prototype.messageToast.call(that, that._oResourceBundle.getText("provideValidDataErrorMessage"));
				return;
			}
			
			oAddPartsPayload = {
				Servicecasenumber: oCntx.Servicecasenumber,
				ErrorMessage: "",
				ToParts: aParts
			};

			if (aParts.length) {
				that._oFragment.openBusyDialogExt.call(that, that._oResourceBundle.getText("busyDialogMsg"));

				oAddPartEvt.sEventType = Constants.POST;
				oAddPartEvt.sEvent = EventTriggers.TRIGGER_PARTS_ADD;
				oAddPartEvt.sEventSuccss = EventTriggers.ADD_PARTS_SUCCESS;
				oAddPartEvt.sEventError = EventTriggers.ADD_PARTS_FAIL;
				oAddPartEvt.sPostEntitySetPath = ServiceConfigConstants.partsCreateSet;
				oAddPartEvt.oPayload = oAddPartsPayload;
				oAddPartEvt.sSuccessHandler = "handlePartsUpdationSuccess";
				oAddPartEvt.sErrorHandler = "handleRequestFail";

				that.finishoDataModelregistartionProcessWithParams.call(that, oAddPartEvt);
			} else {
				BaseController.prototype.messageToast.call(that, that._oResourceBundle.getText("selectPartsToastMessage"));
			}
		},

		/** 
		 * Success call back function for parts add/delete on Work Order
		 * @name handlePartsUpdationSuccess
		 * @param {Object} oSuccess - success response
		 */
		handlePartsUpdationSuccess: function (oSuccess) {
			var sSucMsg = (oSuccess.getId() === EventTriggers.ADD_PARTS_SUCCESS) ?
				that._oResourceBundle.getText("partsAdditionSuccessMessage") :
				that._oResourceBundle.getText("partsDeletionSuccessMessage");

			var oLabOrdModel = this.getComponent().getModel(Constants.MDL_LABORD),
				oCntx = oLabOrdModel.getProperty("/WOCntx");

			that.onDialogClose();
			
			var bError = BaseController.prototype.handleErrorResponseInSuccessEvent.call(that, oSuccess);

			if (!bError) {
				that._oTable.getBinding("items").refresh();
				that._oFragment.openResponseDialog.call(that, {
					msg: sSucMsg + " '" + oCntx.Servicecasenumber + "'",
					statusText: that._oResourceBundle.getText("successStatusMessage"),
					statusState: "Success"
				});
				
				// Start of PCR035112++ changes
				
				if (oCntx.Status === Constants.WO_REJ_STAT && oSuccess.getId() === EventTriggers.ADD_PARTS_SUCCESS) {
					that._fnUpdateWorkOrder();
				} else {
					sap.ui.controller(Constants.CONT_WODETAILS)._fnUpdateElementBindings.call(that);
				}
				
				// End of PCR035112++ changes

				that.onPressCancelEditPart();
			}
		},

		/** 
		 * Error call back function for parts add/delete on Work Order
		 * @name handleRequestFail
		 * @param {Object} oError - error response
		 */
		handleRequestFail: function (oError) {
			that.onDialogClose();
			that.handleEventFail(oError);
		},

		/** 
		 * Event handler to reset Parts Required tables
		 * @name onPressCancelEditPart
		 */
		onPressCancelEditPart: function () {
			that._fnAddHeaderButtons(Constants.CUSTEVT_CANCEL);
			that._fnSetTableinEditMode(false);
			that._oTable.removeSelections();
			that._oAddPartsTable.removeSelections();
			that._oTable.fireSelect();

			var oViewModel = that.getModel(Constants.MDL_PARTSREQVIEW);
			oViewModel.setProperty("/bTableEditMode", false);
			oViewModel.setProperty("/aParts", []);
			that._fnShowNoDataText(true);
			that._fnToggleTableVisibility();
			that.getView().byId(IDH.id.PARTS_REQ_HEADER_CKBX).setSelected(false);
		},

		/** 
		 * Event handler to open parts history dialog
		 * @name onPressPartHistory
		 * @param {sap.ui.base.Event} oEvent - press response
		 */
		onPressPartHistory: function (oEvent) {
			var oPart = oEvent.getSource().getBindingContext().getObject();
			var oViewModel = that.getModel(Constants.MDL_PARTSREQVIEW);
			var oPartHistoryDialog = that._oFragment.createDialogFragment.call(that, Constants.FRAG_PARTHIST);

			oViewModel.setProperty("/sSelPartNo", oPart.PartNumber);

			that.getModel().metadataLoaded().then(function () {
				var sObjectPath = that.getModel().createKey(ServiceConfigConstants.partsListSet, {
					Servicecasenumber: oPart.Servicecasenumber,
					ItemNumber: oPart.ItemNumber
				});

				oPartHistoryDialog.bindElement("/" + sObjectPath);
				oPartHistoryDialog.open();
			}.bind(that));
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
		 * Internal event to create view model and set table header buttons
		 * @name _onObjectMatched
		 * @param {String} sEvt - event reference
		 * @private
		 */
		_onObjectMatched: function (sEvt) {
			var oLabOrdModel = that.getComponent().getModel(Constants.MDL_LABORD),
				bModifyWO = oLabOrdModel.getProperty("/bModifyWO");
			var oView = that.getView(),
				oPartsHdrTable = oView.byId(IDH.id.PARTS_REQ_HDR_TABLE);
			BaseController.prototype.createViewModel.call(this, {
				sModelName: Constants.MDL_PARTSREQVIEW,
				sSelPartNo: "",
				bAddPartEvt: false,
				bTableEditMode: false,
				aParts: []
			});

			//Add Table header buttons
			that._fnAddHeaderButtons(Constants.CUSTEVT_INIT);

			if (that._oTable && that._oAddPartsTable) {
				//Clear Table selections
				that._oTable.removeSelections();
				that._oAddPartsTable.removeSelections();
				that._fnToggleTableVisibility();

				//Set No Data text to Parts Table
				that._fnShowNoDataText(true);
			}

			//Uncheck table selection
			oView.byId(IDH.id.PARTS_REQ_HEADER_CKBX).setSelected(false);

			//Header Table Toggle  Style
			oPartsHdrTable.removeStyleClass(Constants.STYLE_PARTS_HDR);
			oPartsHdrTable.removeStyleClass(Constants.STYLE_PARTS_HDR1);

			if (bModifyWO) {
				oPartsHdrTable.addStyleClass(Constants.STYLE_PARTS_HDR);
			} else {
				oPartsHdrTable.addStyleClass(Constants.STYLE_PARTS_HDR1);
			}
		},

		/** 
		 * Internal event to add buttons to table header
		 * @name _fnAddHeaderButtons
		 * @param {String} sEvt - event reference
		 * @private 
		 */
		_fnAddHeaderButtons: function (sEvt) {
			var oPartsHeaderBox = that.getView().byId(IDH.id.PARTS_REQ_HEADER);
			var oEditBtn = new Button({
				icon: IDH.icons.ICON_EDIT,
				press: that.onPressEditParts
			}).addStyleClass("sapUiTinyMarginEnd");
			var oDeleteBtn = new Button({
				icon: IDH.icons.ICON_DELETE,
				press: that.onPressDeletePart
			}).addStyleClass("sapUiTinyMarginEnd");
			var oUpdateBtn = new Button({
				text: that._oResourceBundle.getText("updateButtonText"),
				type: sap.m.ButtonType.Accept,
				press: that.onPressUpdateParts
			}).addStyleClass("sapUiTinyMarginEnd");
			var oCancelBtn = new Button({
				text: that._oResourceBundle.getText("cancel"),
				type: sap.m.ButtonType.Transparent,
				press: that.onPressCancelEditPart
			});
			var oUploadBtn = new sap.ui.unified.FileUploader({
				icon: IDH.icons.ICON_DOWNLOAD,
				iconFirst: true,
				buttonOnly: true,
				width: "6rem",
				uploadUrl: "",
				name: "PartsFileUploader",
				sameFilenameAllowed: true,
				uploadOnChange: false,
				useMultipart: false,
				sendXHR: true,
				maximumFileSize: 15,
				buttonText: "Import",
				fileType: ["xls", "xlsx"],
				change: that.onPressImportRequiredParts,
				typeMissmatch: that.onFileTypeMissmatch
			}).addStyleClass("spgLabOrdImport");
			var oAddBtn = new Button({
					text: that._oResourceBundle.getText("addPartButtonText"),
					type: sap.m.ButtonType.Accept,
					icon: IDH.icons.ICON_ADD,
					press: that.onPressAddRequiredPart
				}).addStyleClass("spgLabOrdDelBtn")
				.addStyleClass("sapUiTinyMarginBegin");

			oPartsHeaderBox.removeAllItems();

			switch (sEvt) {
			case Constants.CUSTEVT_INIT:
			case Constants.CUSTEVT_CANCEL:
				oPartsHeaderBox.addItem(oEditBtn);
				oPartsHeaderBox.addItem(oDeleteBtn);

				if (!Device.system.phone) {
					oPartsHeaderBox.addItem(oUploadBtn);
				}

				oPartsHeaderBox.addItem(oAddBtn);
				break;
			case Constants.CUSTEVT_EDIT:
				oPartsHeaderBox.addItem(oUpdateBtn);
				oPartsHeaderBox.addItem(oCancelBtn);
				break;
			case Constants.CUSTEVT_SELECT:
				oPartsHeaderBox.addItem(oEditBtn);
				oPartsHeaderBox.addItem(oDeleteBtn);
				oPartsHeaderBox.addItem(oCancelBtn);
				break;
			case Constants.CUSTEVT_ADD:
				if (!Device.system.phone) {
					oPartsHeaderBox.addItem(oUploadBtn);
				}

				oPartsHeaderBox.addItem(oCancelBtn);
				break;
			case Constants.CUSTEVT_UPLOAD:
				oPartsHeaderBox.addItem(oUpdateBtn);
				oPartsHeaderBox.addItem(oCancelBtn);
				break;

			default:
				break;
			}
		},

		/** 
		 * Internal event to toggle the visibility of Parts tables'
		 * @name _fnToggleTableVisibility
		 * @private 
		 */
		_fnToggleTableVisibility: function () {
			var oViewModel = that.getModel(Constants.MDL_PARTSREQVIEW),
				aParts = oViewModel.getProperty("/aParts");
			var aItems = that._oTable.getItems();

			if (aParts.length && aItems.length) {
				that._oTable.setVisible(true);
				that._oAddPartsTable.setVisible(true);
			} else if ((!aParts.length && aItems.length) || (!aParts.length && !aItems.length)) {
				that._oTable.setVisible(true);
				that._oAddPartsTable.setVisible(false);
			} else if (aParts.length && !aItems.length) {
				that._oTable.setVisible(false);
				that._oAddPartsTable.setVisible(true);
			}
		},

		/** 
		 * Internal event to change table mode
		 * @name _fnSetTableinEditMode
		 * @param {Bool} bMode - table edit mode
		 * @private 
		 */
		_fnSetTableinEditMode: function (bMode) {
			var aSelItems = that._oTable.getSelectedItems();
			var oItem, aCells;

			if (!bMode) {
				aSelItems = that._oTable.getItems();
			}

			for (oItem in aSelItems) {
				aCells = aSelItems[oItem].getCells();

				for (var i = 0; i < 7; i++) {
					aCells[i].getItems()[0].setVisible(!bMode);
					aCells[i].getItems()[1].setVisible(bMode);

					//Start of PCR032047++ changes

					if (i === 1) {
						aCells[i].getItems()[1].setEnabled(false);
					}

					//End of PCR032047++ changes

					if (i === 2 || i === 3) {
						aCells[i].getItems()[1].setState(aCells[i].getItems()[0].getText() === Constants.PROP_YES);
						aCells[i].getItems()[1].fireChange();
					} else if (i === 6 && bMode) {
						aCells[2].getItems()[1].fireChange();
						aCells[3].getItems()[1].fireChange();
						aCells[i].getItems()[1].setValue(aCells[i].getItems()[0].getText());
					} else {
						aCells[i].getItems()[1].setValue(aCells[i].getItems()[0].getText());

						if (!i) {
							aCells[i].getItems()[1].setEnabled(false);
						}
					}
				}
			}
		},

		/** 
		 * Internal event to change add parts table in edit mode
		 * @name _fnSetAddPartsTableinEditMode
		 * @private 
		 */
		_fnSetAddPartsTableinEditMode: function () {
			var aSelItems = that._oAddPartsTable.getItems();
			var oItem, aCells;

			for (oItem in aSelItems) {
				aCells = aSelItems[oItem].getCells();

				for (var i = 0; i < 7; i++) {
					if (i === 2 || i === 3) {
						aCells[i].fireChange();
					}
				}
			}
		},

		/** 
		 * Internal event to set no data text to parts table
		 * @name _fnShowNoDataText
		 * @param {Bool} bDisplay - display mode
		 * @private  
		 */
		_fnShowNoDataText: function (bDisplay) {
			that._oTable.setShowNoData(bDisplay);
		},

		/** 
		 * Internal event to validate given parts
		 * @name _fnValidateParts
		 * @param {Object[]} aParts - parts
		 * @private  
		 */
		_fnValidateParts: function (aParts) {
			var oLabOrdModel = that.getComponent().getModel(Constants.MDL_LABORD),
				oCntx = oLabOrdModel.getProperty("/WOCntx");
			var oAddPartEvt = new ModelObj(Constants.MOBJ_OEVENT);
			var oValidatePartsPayload = {
				Servicecasenumber: oCntx.Servicecasenumber,
				ErrorMessage: "",
				ToParts: aParts
			};

			that._oFragment.openBusyDialogExt.call(that, that._oResourceBundle.getText("busyDialogMsg"));

			oAddPartEvt.sEventType = Constants.POST;
			oAddPartEvt.sEvent = EventTriggers.TRIGGER_PARTS_VALIDATE;
			oAddPartEvt.sEventSuccss = EventTriggers.VALIDATE_PARTS_SUCCESS;
			oAddPartEvt.sEventError = EventTriggers.VALIDATE_PARTS_FAIL;
			oAddPartEvt.sPostEntitySetPath = ServiceConfigConstants.partsValidationSet;
			oAddPartEvt.oPayload = oValidatePartsPayload;
			oAddPartEvt.sSuccessHandler = "handlePartsValidationSuccess";
			oAddPartEvt.sErrorHandler = "handleRequestFail";

			that.finishoDataModelregistartionProcessWithParams.call(that, oAddPartEvt);
		},

		/** 
		 * Success event handler for validating given parts
		 * @name handlePartsValidationSuccess
		 * @param {Object} oSuccess - success response
		 */
		handlePartsValidationSuccess: function (oSuccess) {
			var oViewModel = that.getModel(Constants.MDL_PARTSREQVIEW),
				aParts = oViewModel.getProperty("/aParts");

			that.onDialogClose();

			if (oSuccess.hasOwnProperty("mParameters")) {
				var oValidateParts = oSuccess.getParameter(Constants.PROP_DATA).ToParts;

				if (oValidateParts) {
					aParts = oValidateParts.results;
					oViewModel.setProperty("/aParts", aParts);

					aParts = aParts.filter(function (oPart) {
						oPart.bActions = oViewModel.getProperty("/bAddPartEvt");
						oPart.QuantitySupplied = oPart.QuantitySupplied ?
							Formatter.formatQuantity(oPart.QuantitySupplied) : "0";
						oPart.QuantityRequired = oPart.QuantityRequired ?
							Formatter.formatQuantity(oPart.QuantityRequired) : "0";
						return oPart;
					});

					oViewModel.refresh();
					oViewModel.setProperty("/aParts", aParts);
					oViewModel.refresh();

					that._fnShowNoDataText(!aParts.length);
					that._fnToggleTableVisibility();
					that._fnSetAddPartsTableinEditMode();
					that._fnAddHeaderButtons(Constants.CUSTEVT_UPLOAD);
				} else {
					that._oFragment.openResponseDialog.call(that, {
						msg: that._oResourceBundle.getText("partsValidationFailed"),
						statusText: that._oResourceBundle.getText("errorStatusMessage"),
						statusState: sap.ui.core.ValueState.Error
					});
				}
			}
		},

		/** 
		 * Internal method to get required parts for adding on to Work Order
		 * @name _fnGetPartItems
		 * @return {Object[]} - parts array 
		 */
		_fnGetPartItems: function () {
			var aPartItems = that._oTable.getSelectedItems();
			var aParts = [],
				oNewPart = {};
			var aCells, oItem, oPart;

			for (oItem in aPartItems) {
				aCells = aPartItems[oItem].getCells();
				oPart = aPartItems[oItem].getBindingContext().getObject();

				oNewPart.Servicecasenumber = oPart.Servicecasenumber;
				oNewPart.PartNumber = aCells[0].getItems()[1].getValue();
				oNewPart.ItemNumber = oPart.ItemNumber;
				oNewPart.Description = aCells[1].getItems()[1].getValue();
				oNewPart.NsoFlag = aCells[2].getItems()[1].getState() ? Constants.PROP_YES : Constants.PROP_NO;
				oNewPart.SerializedFlag = aCells[3].getItems()[1].getState() ? Constants.PROP_YES : Constants.PROP_NO;
				oNewPart.QuantityRequired = aCells[4].getItems()[1].getValue();
				oNewPart.QuantitySupplied = aCells[5].getItems()[1].getValue();
				oNewPart.SerialNumber = aCells[6].getItems()[1].getValue();

				aParts.push(jQuery.extend({}, oNewPart));
			}

			return aParts;
		},

		//Start of PCR032047++ changes
		
		/** 
		 * Event handler to validate serial number/quantity fields
		 * @name onMandCheckLiveChange
		 * @param {sap.ui.base.Event} oEvent - change event
		 */
		onMandCheckLiveChange: function (oEvent) {
			var oInp = oEvent.getSource();
			
			oInp.setValueState(!oInp.getValue() ? sap.ui.core.ValueState.Error : sap.ui.core.ValueState.None);   
		},

		/** 
		 * Internal event handler to validate parts table mandatory columns
		 * @name _fnValidateMandatoryColumns
		 */
		_fnValidateMandatoryColumns: function () {
			var aPartItems = that._oTable.getSelectedItems();
			var aAddParts = that._oAddPartsTable.getItems();
			var aCells, oItem;

			for (oItem in aPartItems) {
				aCells = aPartItems[oItem].getCells();

				aCells[0].getItems()[1].setValueState(!aCells[0].getItems()[1].getValue() ? sap.ui.core.ValueState.Error : sap.ui.core.ValueState.None);
				aCells[4].getItems()[1].setValueState(!aCells[4].getItems()[1].getValue() ? sap.ui.core.ValueState.Error : sap.ui.core.ValueState.None);
				aCells[5].getItems()[1].setValueState(!aCells[5].getItems()[1].getValue() ? sap.ui.core.ValueState.Error : sap.ui.core.ValueState.None);
				aCells[6].getItems()[1].setValueState(!aCells[6].getItems()[1].getValue() ? sap.ui.core.ValueState.Error : sap.ui.core.ValueState.None);
			}
			
			for (oItem in aAddParts) {
				aCells = aAddParts[oItem].getCells();

				aCells[0].setValueState(!aCells[0].getValue() ? sap.ui.core.ValueState.Error : sap.ui.core.ValueState.None);
				aCells[4].setValueState((!aCells[4].getValue() || aCells[4].getValue() === "0") ? 
										sap.ui.core.ValueState.Error : sap.ui.core.ValueState.None);
				aCells[5].setValueState((!aCells[5].getValue() || aCells[5].getValue() === "0") ? 
										sap.ui.core.ValueState.Error : sap.ui.core.ValueState.None);
				aCells[6].setValueState(!aCells[6].getValue() ? sap.ui.core.ValueState.Error : sap.ui.core.ValueState.None);
			}
		},

		//End of PCR032047++ changes
		
		// Start of PCR033677++ changes
		
		/** 
		 * Event handler to open a staging request
		 * @name onPressOpenWSMReq
		 * @param {sap.ui.base.Event} oEvent - change event
		 */
		onPressOpenWSMReq: function (oEvent) {
			var oCntx = this.getView().getBindingContext().getObject(),
				sWSMReq = oCntx.WSMRequestLaunch,
				sId = oCntx.StagingId;
			
			if (sWSMReq) {
				sWSMReq = sWSMReq.replace("<<????>>", sId);
				window.open(sWSMReq, "_blank");
			}
		},
		
		/** 
		 * Event handler to create a staging request
		 * @name onCreateStagingRequest
		 * @param {sap.ui.base.Event} oEvent - change event
		 */
		onCreateStagingRequest: function(oEvent) {
			that._oSwitch = oEvent.getSource();
			
			if (that._oSwitch.getState()) {
			sap.m.MessageBox.confirm(that._oResourceBundle.getText("stagingDraft"), {
				actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CLOSE],
				onClose: function (sAction) {
					if (sAction === sap.m.MessageBox.Action.CLOSE) {
						that._oSwitch.setState(false);
					} else {
						that._oFragment.openBusyDialogExt.call(that, that._oResourceBundle.getText("busyDialogMsg"));
						var oCntx = this.getView().getBindingContext().getObject();
						var oPayload = {
							WorkOrder: oCntx.Servicecasenumber,
						    RequestorName: oCntx.RequestedbyName,   
						    BusinessUnit: oCntx.Pbg,  
						    Chamber: oCntx.Assembly,
						    ToolId: oCntx.Serialnumber,
						    Building: oCntx.BuildingNo,
						    PlannedStartDate: oCntx.PlanStartDateTime.slice(0, 8),
						    PlannedEndDate: oCntx.PlanEndDateTime.slice(0, 8)
						};
						var oToolDataReq = new Promise(function (fnResolve, fnReject) {
							jQuery.ajax({
								type: Constants.POST,
								url: oCntx.WSMCreateRequest,
								data: oPayload,
								dataType: "json",
								async: true,
								success: function (oData, oResponse) {
									if (!oData) {
										fnReject({
											error: true
										});
									} else {
										fnResolve({
											data: oData
										});
									}
								},
								error: function (error) {
									fnResolve({
										error: true
									});
								}
							});
						});

						oToolDataReq.then(
							function (mParams) {
								if (!mParams || mParams.error) {
									that.onDialogClose();
									that._oSwitch.setState(false);
									sap.m.MessageToast.show("stagingReqErrMsg");
									return;
								}

								var oCnxt = that.getView().getBindingContext().getObject();
								that._sStagingNo = mParams.data;
								
								if (mParams.data) {
									var aStaging = that._sStagingNo.split("$#$");
									var oODataModel = new sap.ui.model.odata.ODataModel(that.getModel().sServiceUrl, true);
									
									if (aStaging.length > 1) {
										oCnxt.StagingNo = aStaging[0];
										oCnxt.StagingId = aStaging[1];
										oCnxt.Category1 = "LAB";
										
										oODataModel.create("/WorkOrderSet", oCnxt, {
											success: function(oData) {
												that.onDialogClose();
												sap.ui.controller(Constants.CONT_WODETAILS)._fnUpdateElementBindings();
												var sMsg = 
												that._oFragment.handleCallBackResponse.call(that,
													that._oResourceBundle.getText("successResponseHeader"),
													that._oResourceBundle.getText("stagingReqSuccMsg") + " " + aStaging[0]
													
												);
											},
											error: function(oError) {
												that.onDialogClose();
												that._oFragment.handleCallBackResponse.call(that,
													that._oResourceBundle.getText("successResponseHeader"),
													that._oResourceBundle.getText("stagingReqSuccMsg") + " " + that._sStagingNo
												);
											}
										});
									} else {
										that._oSwitch.setState(false);
										that.onDialogClose();
										that._oFragment.handleCallBackResponse.call(that,
											that._oResourceBundle.getText("errorResponseHeader"),
											that._sStagingNo
										);
									}
								}
							}.bind(that)
						);
					}
				}.bind(this)
			});
			}
		},
		
		// End of PCR033677++ changes
		
		// Start of PCR035112++ changes
		
		/** 
		 * Internal event for updating Work Order
		 * @name _fnUpdateWorkOrder
		 */
		_fnUpdateWorkOrder: function() {
			var oLabOrdModel = that.getComponent().getModel(Constants.MDL_LABORD),
			oCntx = oLabOrdModel.getProperty("/WOCntx");
			var oWOCrtPayload = jQuery.extend({}, {
				Servicecasenumber: oCntx.Servicecasenumber,
				Status: Constants.WO_SUB_STAT
			});	
			
			var oWorkOrderEvt = new ModelObj(Constants.MOBJ_OEVENT);

			oWorkOrderEvt.sEventType = Constants.POST;
			oWorkOrderEvt.sEvent = EventTriggers.TRIGGER_CREATE_WORKORDER;
			oWorkOrderEvt.sEventSuccss = EventTriggers.CREATE_WORKORDER_SUCCESS;
			oWorkOrderEvt.sEventError = EventTriggers.CREATE_WORKORDER_FAIL;
			oWorkOrderEvt.sPostEntitySetPath = ServiceConfigConstants.workOrderStatusUpdateSet;
			oWorkOrderEvt.oPayload = oWOCrtPayload;
			oWorkOrderEvt.sSuccessHandler = "handleWorkOrderUpdateSuccess";
			oWorkOrderEvt.sErrorHandler = "handleRequestFail";

			this.finishoDataModelregistartionProcessWithParams.call(this, oWorkOrderEvt);
		},
		
		/** 
		 * Success event handler for updating Work Order
		 * @name handleWorkOrderUpdateSuccess
		 * @param {Object} oSuccess - success response
		 */
		handleWorkOrderUpdateSuccess: function (oSuccess) {
			sap.ui.controller(Constants.CONT_WODETAILS)._fnUpdateElementBindings.call(this);
		}
		
		// End of PCR035112++ changes

	});

});