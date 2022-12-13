import Controller from 'sap/ui/core/mvc/Controller';
import MessageToast from 'sap/m/MessageToast';
import JSONModel from 'sap/ui/model/json/JSONModel';
import ResourceModel from 'sap/ui/model/resource/ResourceModel';
import ResourceBundle from 'sap/base/i18n/ResourceBundle';
import { IconColor } from 'sap/ui/core/library';
import Event from 'sap/ui/base/Event';
import ListBinding from 'sap/ui/model/ListBinding';
import Filter from 'sap/ui/model/Filter';
import SelectDialog from 'sap/m/SelectDialog';
import Fragment from 'sap/ui/core/Fragment';
import Control from 'sap/ui/core/Control';
import StandardListItem from 'sap/m/StandardListItem';
import UIComponent from 'sap/ui/core/UIComponent';

enum Threshold {
  Warm = 4,
  Hot = 5
}

export default class Sensors extends Controller {
  private customFilters: Filter[] = [];
  private statusFilters: Filter[] = [];
  private dialog: Promise<SelectDialog>;

  public onInit(): void {
    const ownerComp = this.getOwnerComponent();
    if (this.getSensorModel().isA('sap.ui.model.json.JSONModel')) {
      this.getSensorModel()
        .dataLoaded()
        .then(() => {
          const resourceBundle = (ownerComp?.getModel('i18n') as ResourceModel).getResourceBundle() as ResourceBundle;
          MessageToast.show(resourceBundle.getText('msgSensorDataLoaded'), { closeOnBrowserNavigation: false });
        })
        .catch((oErr: Error) => {
          MessageToast.show(oErr.message, { closeOnBrowserNavigation: false });
        });
    }
  }

  public getSensorModel(): JSONModel {
    return this.getOwnerComponent().getModel('sensorModel') as JSONModel;
  }

  onSensorSelect(event: Event): void {
    const listBinding = this.getView().byId('sensorsList').getBinding('items') as ListBinding;
    const key = event.getParameter('key') as String;

    if (key === 'Cold') {
      this.statusFilters = [new Filter('temperature', 'LT', Threshold.Warm, false)];
    } else if (key === 'Warm') {
      this.statusFilters = [new Filter('temperature', 'BT', Threshold.Warm, Threshold.Hot)];
    } else if (key === 'Hot') {
      this.statusFilters = [new Filter('temperature', 'GT', Threshold.Hot, false)];
    } else {
      this.statusFilters = [];
    }

    listBinding.filter(this.statusFilters.concat(this.customFilters));
  }

  onCustomerSelect(): void {
    if (!(this.dialog instanceof Promise)) {
      const resourceModel = this.getView().getModel('i18n') as ResourceModel;
      this.dialog = Fragment.load({ type: 'XML', name: 'keepcool.sensormanager.view.CustomerSelectDialog', controller: this }).then(
        (control: Control | Control[]) => {
          const dialog = (control instanceof Array ? control[0] : control) as SelectDialog;
          dialog.setModel(this.getSensorModel(), 'sensorModel');
          dialog.setModel(resourceModel, 'i18n');
          dialog.setMultiSelect(true);
          return dialog;
        }
      );
    }

    this.dialog
      .then(dialog => {
        dialog.open('');
      })
      .catch((err: Error) => {
        MessageToast.show(err.message);
      });
  }

  onCustomerSelectChange(event: Event): void {
    const value = event.getParameter('value') as string;
    const filter = new Filter('name', 'Contains', value);
    const listBinding = (event.getSource() as Control).getBinding('items') as ListBinding;
    listBinding.filter([filter]);
  }

  onCustomerSelectConfirm(event: Event): void {
    const selectedItems = event.getParameter('selectedItems') as StandardListItem[];
    const listBinding = this.getView()?.byId('sensorsList')?.getBinding('items') as ListBinding;
    this.customFilters = selectedItems.map((item: StandardListItem) => {
      return new Filter('customer', 'EQ', item.getTitle());
    });
    listBinding.filter(this.customFilters.concat(this.statusFilters));
  }

  navToSensorStatus(event: Event): void {
    const sensorIndex = (event.getSource() as Control).getBindingContext('sensorModel')?.getProperty('index') as number;
    (this.getOwnerComponent() as UIComponent).getRouter().navTo('RouteSensorStatus', { index: sensorIndex });
  }

  formatIconColor(temperature: number): IconColor | String {
    if (temperature < Threshold.Warm) {
      return '#0984e3';
    } else if (temperature >= Threshold.Warm && temperature < Threshold.Hot) {
      return IconColor.Critical;
    } else {
      return IconColor.Negative;
    }
  }

  formatThermometerColor(temperature: number) {
    if (!Threshold) {
      return 'black';
    } else if (temperature < Threshold.Warm) {
      return '#1873B4'; // less obtrusive than the standard "blue"
    } else if (temperature >= Threshold.Warm && temperature < Threshold.Hot) {
      return 'orange';
    } else {
      return 'red';
    }
  }
}
