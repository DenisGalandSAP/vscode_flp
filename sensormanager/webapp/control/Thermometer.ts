import UI5Control from 'sap/ui/core/Control';
import RenderManager from 'sap/ui/core/RenderManager';

/**
 * @name keepcool.sensormanager.control.Thermometer
 */
export default class Thermometer extends UI5Control {
  static readonly metadata = {
    properties: {
      color: 'string',
      value: 'float'
    }
  };

  renderer = {
    apiVersion: 2,
    render: (rm: RenderManager, control: Thermometer) => {
      // @ts-ignore
      if (control.getValue()) {
        rm.openStart('figure', control);
        rm.class('thermometer');
        // @ts-ignore
        rm.style('border', '2px solid ' + control.getColor());
        rm.openEnd();

        rm.openStart('figcaption');
        rm.class('thermometer-value');
        // @ts-ignore
        rm.style('background-color', control.getColor());
        // @ts-ignore
        rm.style('box-shadow', '0 0 0 2px ' + control.getColor());
        rm.openEnd();
        // @ts-ignore
        rm.text(control.getValue().toFixed(1)); // the temperature value
        rm.close('figcaption');

        rm.openStart('div');
        rm.class('thermometer-level');
        // @ts-ignore
        var temperatureHeight = Math.min(control.getValue() * 7, 50) + 5; // values should range from 5 to 55
        rm.style('height', temperatureHeight + 'px');
        // @ts-ignore
        rm.style('background-color', control.getColor());
        rm.openEnd();
        rm.close('div');

        rm.close('figure');
      }
    }
  };
}
