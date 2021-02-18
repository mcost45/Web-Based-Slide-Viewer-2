// store constants necessary for app; import to components as needed
export class AppConstants {
  // default vmic file to load - (the only one included by default)
  public static DEFAULT_VMIC = 'Convallaria majalis - Root.vmic';
  // name of the zipped folder within the .vmic that contains the DZC Outputs
  public static DZC_OUTPUT_DIR = 'Image';
  // data type to load zip contents as
  public static DEFAULT_ZIP_DATA_TYPE = 'blob';
  // location that the .vmic files are stored in
  public static VMIC_LOCATION = 'assets/VMICs/';
  // name of the dzc_output XML file with OSD settings
  public static PYRAMID_FILE = 'dzc_output.xml';
  // element within the dzc_output XML file with OSD Image setting attributes
  public static XML_ELEMENT = 'Image';
  // element within the dzc_output XML file Image element with OSD Size setting attributes
  public static XML_ELEMENT_SIZE = 'Size';
  // XMLJS tag for accessing XML attribute properties
  public static XML_ATTRIBUTES = '_attributes';
  // default settings for OpenSeadragon
  public static OSD_SETTINGS = {
    WRAPPER_ID: 'osd-wrapper',
    SHOW_NAVIGATION_CONTROL: false,
    MAX_LEVEL: 14,
    MIN_LEVEL: 10,
    SHOW_NAVIGATOR: true,
    NAVIGATOR_POSITION: 'ABSOLUTE' as
      'ABSOLUTE' | 'TOP_LEFT' | 'TOP_RIGHT' | 'BOTTOM_LEFT' | 'BOTTOM_RIGHT',
    NAVIGATOR_LEFT: '16px',
    NAVIGATOR_TOP: '16px',
    NAVIGATOR_WIDTH: '124px',
    NAVIGATOR_HEIGHT: '100px',
    NAVIGATOR_AUTO_RESIZE: false,
    NAVIGATOR_AUTO_FADE: false,
    NAVIGATOR_MAINTAIN_SIZE_RATIO: false,
    NAVIGATOR_BORDER_COLOR: 'none',
    NAVIGATOR_OPACITY: 1,
    VISIBILITY_RATIO: 0.7,
    ZOOM_PER_SCROLL: 1.55,
    GESTURE_SETTINGS_MOUSE: {
      clickToZoom: false,
      dbllickToZoom: true,
    }
  };
}
