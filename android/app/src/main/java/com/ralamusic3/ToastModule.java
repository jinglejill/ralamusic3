package com.ralamusic3;

import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.provider.MediaStore;
import android.util.Log;
import android.widget.Toast;

import androidx.annotation.NonNull;

import com.brother.ptouch.sdk.LabelInfo;
import com.brother.ptouch.sdk.NetPrinter;
import com.brother.ptouch.sdk.PrinterStatus;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

import com.brother.ptouch.sdk.Printer;
import com.brother.ptouch.sdk.PrinterInfo;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;
import com.google.gson.Gson;

import org.json.JSONException;
import org.json.JSONObject;

import static java.lang.Thread.sleep;

public class ToastModule extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;

    private static final String DURATION_SHORT_KEY = "SHORT";
    private static final String DURATION_LONG_KEY = "LONG";


    private final ArrayList<String> mFiles = new ArrayList<String>();
    ToastModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @NonNull
    @Override
    public String getName() {
        return "ToastExample";
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put(DURATION_SHORT_KEY, Toast.LENGTH_SHORT);
        constants.put(DURATION_LONG_KEY, Toast.LENGTH_LONG);
        return constants;
    }

    public PrinterInfo.Model getPrinterModel(String printerModel)
    {
        Log.wtf("testprint","getprinterModel:"+printerModel);
        if(printerModel.equals("QL-720NW"))
        {
            Log.wtf("testprint","getprinterModel return:QL_720NW");
            return PrinterInfo.Model.QL_720NW;

        }
        else if(printerModel.equals("QL-820NWB"))
        {
            return PrinterInfo.Model.QL_820NWB;
        }
        return null;
    }

    public PrinterInfo.Orientation getOrientation(String orientation)
    {
        Log.wtf("testprint","getOrientation:"+orientation);
        if(orientation.equals("Portrait"))
        {
            Log.wtf("testprint","getOrientation return:Portrait");
            return PrinterInfo.Orientation.PORTRAIT;

        }
        else if(orientation.equals("Landscape"))
        {
            return PrinterInfo.Orientation.LANDSCAPE;
        }
        return null;
    }

    public int getLabelNameIndex(String paperSize)
    {
        if(paperSize.equals("W29"))
        {
            return LabelInfo.QL700.W29.ordinal();
        }
        else if(paperSize.equals("W62"))
        {
            return LabelInfo.QL700.W62.ordinal();
        }
        else if(paperSize.equals("W62H29"))
        {
            return LabelInfo.QL700.W62H29.ordinal();
        }
        return 0;
    }

    @ReactMethod
    public void getPrinterList(Callback printerListCallback) {//String imagePath,int quantity


        SharedPreferences sharedPref = getReactApplicationContext().getSharedPreferences("com.jummumtech.ralamusic",getReactApplicationContext().MODE_PRIVATE);
        String model = sharedPref.getString("printerModel","");

        Log.wtf("testprint","getPrinterList model:"+model);
        new Thread(new Runnable() {
            @Override
            public void run() {
                int i=0;
                List<Map<String, String>> data = new ArrayList<>();
                Printer printer = new Printer();
                NetPrinter[] printerList = printer.getNetPrinters(model);//("QL-720NW");
                for (NetPrinter netPrinter: printerList) {
                    Log.d("TAG", String.format("Model: %s, IP Address: %s", netPrinter.modelName, netPrinter.ipAddress));
                    Log.wtf("testprint",String.format("Model: %s, IP Address: %s", netPrinter.modelName, netPrinter.ipAddress));
                    Map<String, String> map = new HashMap<String, String>();
                    map.put("model", netPrinter.modelName);
                    map.put("ipAddress", netPrinter.ipAddress);

                    data.add(i, map);
                    i++;
                }
                Log.wtf("testprint", Arrays.toString(data.toArray()));

                Gson g = new Gson();
                WritableArray array = new WritableNativeArray();
                for (Map<String, String> map : data) {
                    JSONObject jo = null;
                    try {
                        jo = new JSONObject(g.toJson(map));
                        WritableMap wm = convertJsonToMap(jo);
                        array.pushMap(wm);
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                }
                printerListCallback.invoke(array);
            }
        }).start();
    }

    @ReactMethod
    public void getPrinterStatus(Callback statusCallback) {
        SharedPreferences sharedPref = getReactApplicationContext().getSharedPreferences("com.jummumtech.ralamusic",getReactApplicationContext().MODE_PRIVATE);
        String printerModel = sharedPref.getString("printerModel","");
        String ipAddress = sharedPref.getString("ipAddress","");
        String paperSize = sharedPref.getString("paperSize","");
        String orientation = sharedPref.getString("orientation","");
        String autoCut = sharedPref.getString("autoCut","");
        String cutAtEnd = sharedPref.getString("cutAtEnd","");
        Log.wtf("testprint","autoCut:"+autoCut);
        if(printerModel == "" || ipAddress == "" || paperSize == "")
        {
            Log.wtf("testprint","get printer status");
            statusCallback.invoke("Not connected");
            return;
        }

        final Printer printer = new Printer();
        PrinterInfo settings = printer.getPrinterInfo();
        settings.printerModel = getPrinterModel(printerModel);//PrinterInfo.Model.QL_720NW;
        settings.port = PrinterInfo.Port.NET;
        settings.ipAddress = ipAddress;//"192.168.100.19";
        settings.labelNameIndex = getLabelNameIndex(paperSize);//LabelInfo.QL700.W29.ordinal();//.QL1100.W102H51.ordinal();
        settings.printMode = PrinterInfo.PrintMode.FIT_TO_PAGE;
        settings.isAutoCut = autoCut == "YES";
        settings.isCutAtEnd = cutAtEnd == "YES";
        settings.orientation = getOrientation(orientation);//PrinterInfo.Orientation.PORTRAIT;
        settings.valign = PrinterInfo.VAlign.MIDDLE;
//        settings.numberOfCopies = quantity;


        settings.halftone = PrinterInfo.Halftone.THRESHOLD;
        settings.paperPosition = PrinterInfo.Align.CENTER;

        printer.setPrinterInfo(settings);



        // Connect, then print
        new Thread(new Runnable() {
            @Override
            public void run() {

                Log.wtf("testprint","before getStatus");
                PrinterStatus printerStatus = printer.getPrinterStatus();
                Log.wtf("testprint","after getStatus");
                if(printerStatus.errorCode == PrinterInfo.ErrorCode.ERROR_NONE)
                {
                    Log.wtf("testprint","getStatus error none");
                    statusCallback.invoke("Connected");
                    return;
                }
                else {
                    Log.wtf("testprint", "getStatus error something");
                    statusCallback.invoke("Not connected");

                    Log.wtf("testprint", "errorCodeName:" + printerStatus.errorCode.name());
                    return;
                }
            }
        }).start();
    }

    @ReactMethod
    public void print(String imagePath, int quantity, Callback resultCallback) {
        Log.wtf("testprint","call print");
        Log.wtf("testprint","quantity print:"+quantity);
        Log.wtf("testprint","imagePath print:"+imagePath);
        SharedPreferences sharedPref = getReactApplicationContext().getSharedPreferences("com.jummumtech.ralamusic",getReactApplicationContext().MODE_PRIVATE);
        String printerModel = sharedPref.getString("printerModel","");
        String ipAddress = sharedPref.getString("ipAddress","");
        String paperSize = sharedPref.getString("paperSize","");
        String orientation = sharedPref.getString("orientation","");
        String autoCut = sharedPref.getString("autoCut","");
        String cutAtEnd = sharedPref.getString("cutAtEnd","");
        if(printerModel == "" || ipAddress == "" || paperSize == "")
        {
            resultCallback.invoke(0,"Printer is not connected");
            return;
        }

        final Printer printer = new Printer();
        PrinterInfo settings = printer.getPrinterInfo();
        settings.printerModel = getPrinterModel(printerModel);//PrinterInfo.Model.QL_720NW;
        settings.port = PrinterInfo.Port.NET;
        settings.ipAddress = ipAddress;//"192.168.100.19";
        settings.labelNameIndex = getLabelNameIndex(paperSize);//LabelInfo.QL700.W29.ordinal();
        settings.printMode = PrinterInfo.PrintMode.FIT_TO_PAGE;
        settings.isAutoCut = autoCut == "YES";
        settings.isCutAtEnd = cutAtEnd == "YES";
        settings.orientation = getOrientation(orientation);//PrinterInfo.Orientation.PORTRAIT;
        settings.numberOfCopies = quantity;
        settings.halftone = PrinterInfo.Halftone.THRESHOLD;
        settings.paperPosition = PrinterInfo.Align.CENTER;
        settings.valign = PrinterInfo.VAlign.MIDDLE;
        printer.setPrinterInfo(settings);


        Log.wtf("testprint","print autocut:"+settings.isAutoCut);

        // Connect, then print
        new Thread(new Runnable() {
            @Override
            public void run() {

                PrinterStatus printerStatus = printer.getPrinterStatus();
                if(printerStatus.errorCode == PrinterInfo.ErrorCode.ERROR_NONE)
                {
                    Log.wtf("testprint","getStatus error none");
//                    resultCallback.invoke("Connected");


                    File f= new File(imagePath);
                    BitmapFactory.Options options = new BitmapFactory.Options();
                    options.inPreferredConfig = Bitmap.Config.ARGB_8888;
                    Bitmap bitmap = null;
                    try {
                        bitmap = BitmapFactory.decodeStream(new FileInputStream(f), null, options);
                    } catch (FileNotFoundException e) {
                        e.printStackTrace();
                        Log.wtf("testprint","file not found:"+e.getMessage());
                        resultCallback.invoke(0,"ไม่พบรูป QR Code");
                    }

                    if (printer.startCommunication()) {

                        int width          = bitmap.getWidth();
                        int height         = bitmap.getHeight();
                        Log.wtf("testprint","width:"+width);
                        Log.wtf("testprint","height:"+height);
                        int x = (int)Math.round(0.06*width);
                        int y = (int)Math.round(0.075*height);
                        int newWidth = (int)Math.round(0.88*width);
                        int newHeight = (int)Math.round(0.85*height);
//                        int x = (int)Math.round(0.09*width);
//                        int y = (int)Math.round(0.15*height);
//                        int newWidth = (int)Math.round(0.82*width);
//                        int newHeight = (int)Math.round(0.7*height);

                        //crop image
                        Bitmap resizedbitmap1=Bitmap.createBitmap(bitmap, x,y,newWidth,newHeight);
                        MediaStore.Images.Media.insertImage( getReactApplicationContext().getContentResolver(), resizedbitmap1, "qr" , "product qr");

                        PrinterStatus result = printer.printImage(resizedbitmap1);
                        if (result.errorCode != PrinterInfo.ErrorCode.ERROR_NONE) {
                            Log.wtf("testprint", "ERROR - " + result.errorCode);
                            resultCallback.invoke(0,"ERROR - " + result.errorCode.name());
                        }
                        else
                        {
                            Log.wtf("testprint", "print succeed");
                            resultCallback.invoke(1,"พิมพ์ QR Code สำเร็จ");
                        }
                        printer.endCommunication();
                    }
                }
                else
                {
                    Log.wtf("testprint","getStatus error something");
                    resultCallback.invoke(0,"Printer is not connected");

                    Log.wtf("testprint", "errorCodeName:" + printerStatus.errorCode.name());
                }
            }
        }).start();

    }

    @ReactMethod
    public void savePreferenceModel(String model) {
        Log.wtf("testprint"," preference model enter:"+model);
        SharedPreferences sharedPref = getReactApplicationContext().getSharedPreferences("com.jummumtech.ralamusic",getReactApplicationContext().MODE_PRIVATE);

        SharedPreferences.Editor editor = sharedPref.edit();
        editor.putString("printerModel", model);
        editor.commit();

        String printerModel = sharedPref.getString("printerModel","");
        Log.wtf("testprint"," preference model save:"+printerModel);

    }

    @ReactMethod
    public void getPreferenceModel(Callback preferenceModelCallback) {
        SharedPreferences sharedPref = getReactApplicationContext().getSharedPreferences("com.jummumtech.ralamusic",getReactApplicationContext().MODE_PRIVATE);
        preferenceModelCallback.invoke(sharedPref.getString("printerModel",""));
    }


    @ReactMethod
    public void savePreferencePaperSize(String paperSize) {
        Log.wtf("testprint"," preference paper size enter:"+paperSize);
        SharedPreferences sharedPref = getReactApplicationContext().getSharedPreferences("com.jummumtech.ralamusic",getReactApplicationContext().MODE_PRIVATE);

        SharedPreferences.Editor editor = sharedPref.edit();
        editor.putString("paperSize", paperSize);
        editor.commit();

        String paperSizePref = sharedPref.getString("paperSize","");
        Log.wtf("testprint"," preference paper size save:"+paperSizePref);

    }

    @ReactMethod
    public void getPreferencePaperSize(Callback preferenceModelCallback) {
        SharedPreferences sharedPref = getReactApplicationContext().getSharedPreferences("com.jummumtech.ralamusic",getReactApplicationContext().MODE_PRIVATE);
        preferenceModelCallback.invoke(sharedPref.getString("paperSize",""));
    }

    @ReactMethod
    public void savePreferenceIpAddress(String ipAddress) {
        Log.wtf("testprint"," preference ip address enter:"+ipAddress);
        SharedPreferences sharedPref = getReactApplicationContext().getSharedPreferences("com.jummumtech.ralamusic",getReactApplicationContext().MODE_PRIVATE);

        SharedPreferences.Editor editor = sharedPref.edit();
        editor.putString("ipAddress", ipAddress);
        editor.commit();

        String ipAddressPref = sharedPref.getString("ipAddress","");
        Log.wtf("testprint"," preference ip address save:"+ipAddressPref);

    }

    @ReactMethod
    public void getPreferenceIpAddress(Callback preferenceIpAddressCallback) {
        SharedPreferences sharedPref = getReactApplicationContext().getSharedPreferences("com.jummumtech.ralamusic",getReactApplicationContext().MODE_PRIVATE);
        preferenceIpAddressCallback.invoke(sharedPref.getString("ipAddress",""));
    }

    @ReactMethod
    public void savePreferenceOrientation(String orientation) {
        Log.wtf("testprint"," preference orientation enter:"+orientation);
        SharedPreferences sharedPref = getReactApplicationContext().getSharedPreferences("com.jummumtech.ralamusic",getReactApplicationContext().MODE_PRIVATE);

        SharedPreferences.Editor editor = sharedPref.edit();
        editor.putString("orientation", orientation);
        editor.commit();

        String orientationPref = sharedPref.getString("orientation","");
        Log.wtf("testprint"," preference orientation save:"+orientationPref);

    }

    @ReactMethod
    public void getPreferenceOrientation(Callback preferenceOrientationCallback) {
        SharedPreferences sharedPref = getReactApplicationContext().getSharedPreferences("com.jummumtech.ralamusic", getReactApplicationContext().MODE_PRIVATE);

        String preferenceOrientation = sharedPref.getString("orientation","");
        if(preferenceOrientation == "")
        {
            savePreferenceOrientation("Portrait");
            preferenceOrientationCallback.invoke("Portrait");
        }
        else
        {
            preferenceOrientationCallback.invoke(sharedPref.getString("orientation",""));
        }
    }


    @ReactMethod
    public void savePreferenceAutoCut(String autoCut) {
        Log.wtf("testprint"," preference autoCut enter:"+autoCut);
        SharedPreferences sharedPref = getReactApplicationContext().getSharedPreferences("com.jummumtech.ralamusic",getReactApplicationContext().MODE_PRIVATE);

        SharedPreferences.Editor editor = sharedPref.edit();
        editor.putString("autoCut", autoCut);
        editor.commit();

        String autoCutPref = sharedPref.getString("autoCut","");
        Log.wtf("testprint"," preference autoCut save:"+autoCutPref);

    }

    @ReactMethod
    public void getPreferenceAutoCut(Callback preferenceAutoCutCallback) {
        SharedPreferences sharedPref = getReactApplicationContext().getSharedPreferences("com.jummumtech.ralamusic",getReactApplicationContext().MODE_PRIVATE);

        String preferenceAutoCut = sharedPref.getString("autoCut","");
        if(preferenceAutoCut == "")
        {
            savePreferenceAutoCut("YES");
            preferenceAutoCutCallback.invoke("YES");
        }
        else
        {
            preferenceAutoCutCallback.invoke(sharedPref.getString("autoCut",""));
        }
    }

    @ReactMethod
    public void savePreferenceCutAtEnd(String cutAtEnd) {
        Log.wtf("testprint"," preference cutAtEnd enter:"+cutAtEnd);
        SharedPreferences sharedPref = getReactApplicationContext().getSharedPreferences("com.jummumtech.ralamusic",getReactApplicationContext().MODE_PRIVATE);

        SharedPreferences.Editor editor = sharedPref.edit();
        editor.putString("cutAtEnd", cutAtEnd);
        editor.commit();

        String cutAtEndPref = sharedPref.getString("cutAtEnd","");
        Log.wtf("testprint"," preference cutAtEnd save:"+cutAtEndPref);

    }

    @ReactMethod
    public void getPreferenceCutAtEnd(Callback preferenceCutAtEndCallback) {
        SharedPreferences sharedPref = getReactApplicationContext().getSharedPreferences("com.jummumtech.ralamusic",getReactApplicationContext().MODE_PRIVATE);

        String preferenceCutAtEnd = sharedPref.getString("cutAtEnd","");
        if(preferenceCutAtEnd == "")
        {
            savePreferenceCutAtEnd("YES");
            preferenceCutAtEndCallback.invoke("YES");
        }
        else
        {
            preferenceCutAtEndCallback.invoke(sharedPref.getString("cutAtEnd",""));
        }
    }

    @ReactMethod
    public void savePreferenceUsername(String username) {
        SharedPreferences sharedPref = getReactApplicationContext().getSharedPreferences("com.jummumtech.ralamusic",getReactApplicationContext().MODE_PRIVATE);
        SharedPreferences.Editor editor = sharedPref.edit();
        editor.putString("username", username);
        editor.commit();
    }

    @ReactMethod
    public void getPreferenceUsername(Callback preferenceUsernameCallback) {
        SharedPreferences sharedPref = getReactApplicationContext().getSharedPreferences("com.jummumtech.ralamusic",getReactApplicationContext().MODE_PRIVATE);

        String preferenceUsername = sharedPref.getString("username","");
        preferenceUsernameCallback.invoke(preferenceUsername);
    }

    @ReactMethod
    public void savePreferencePassword(String password) {
        SharedPreferences sharedPref = getReactApplicationContext().getSharedPreferences("com.jummumtech.ralamusic",getReactApplicationContext().MODE_PRIVATE);
        SharedPreferences.Editor editor = sharedPref.edit();
        editor.putString("password", password);
        editor.commit();
    }

    @ReactMethod
    public void getPreferencePassword(Callback preferencePasswordCallback) {
        SharedPreferences sharedPref = getReactApplicationContext().getSharedPreferences("com.jummumtech.ralamusic",getReactApplicationContext().MODE_PRIVATE);

        String preferencePassword = sharedPref.getString("password","");
        preferencePasswordCallback.invoke(preferencePassword);
    }

    @ReactMethod
    public void savePreferenceRememberMe(Boolean rememberMe) {
        SharedPreferences sharedPref = getReactApplicationContext().getSharedPreferences("com.jummumtech.ralamusic",getReactApplicationContext().MODE_PRIVATE);
        SharedPreferences.Editor editor = sharedPref.edit();
        editor.putBoolean("rememberMe", rememberMe);
        editor.commit();
    }

    @ReactMethod
    public void getPreferenceRememberMe(Callback preferenceRememberMeCallback) {
        SharedPreferences sharedPref = getReactApplicationContext().getSharedPreferences("com.jummumtech.ralamusic",getReactApplicationContext().MODE_PRIVATE);

        Boolean preferenceRememberMe = sharedPref.getBoolean("rememberMe",false);
        preferenceRememberMeCallback.invoke(preferenceRememberMe);
    }

    @ReactMethod
    public void savePreferenceCurrentUsername(String username) {
        SharedPreferences sharedPref = getReactApplicationContext().getSharedPreferences("com.jummumtech.ralamusic",getReactApplicationContext().MODE_PRIVATE);
        SharedPreferences.Editor editor = sharedPref.edit();
        editor.putString("currentUsername", username);
        editor.commit();
    }

    @ReactMethod
    public void getPreferenceCurrentUsername(Callback preferenceCurrentUsernameCallback) {
        SharedPreferences sharedPref = getReactApplicationContext().getSharedPreferences("com.jummumtech.ralamusic",getReactApplicationContext().MODE_PRIVATE);

        String preferenceCurrentUsername = sharedPref.getString("currentUsername","");
        preferenceCurrentUsernameCallback.invoke(preferenceCurrentUsername);
    }

    private static WritableMap convertJsonToMap(JSONObject jsonObject) throws JSONException {
        WritableMap map = new WritableNativeMap();

        Iterator<String> iterator = jsonObject.keys();
        while (iterator.hasNext()) {
            String key = iterator.next();
            Object value = jsonObject.get(key);
            if (value instanceof JSONObject) {
                map.putMap(key, convertJsonToMap((JSONObject) value));
            } else if (value instanceof Boolean) {
                map.putBoolean(key, (Boolean) value);
            } else if (value instanceof Integer) {
                map.putInt(key, (Integer) value);
            } else if (value instanceof Double) {
                map.putDouble(key, (Double) value);
            } else if (value instanceof String) {
                map.putString(key, (String) value);
            } else {
                map.putString(key, value.toString());
            }
        }
        return map;
    }
}

