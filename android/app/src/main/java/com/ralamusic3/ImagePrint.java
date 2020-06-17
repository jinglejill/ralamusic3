package com.ralamusic3;

import android.content.Context;
import android.util.Log;

import com.brother.ptouch.sdk.PrinterInfo.ErrorCode;
//import com.brother.ptouch.sdk.printdemo.common.MsgDialog;
//import com.brother.ptouch.sdk.printdemo.common.MsgHandle;

import java.util.ArrayList;

public class ImagePrint extends BasePrint {

    private ArrayList<String> mImageFiles;

    public ImagePrint(Context context){//}, MsgHandle mHandle, MsgDialog mDialog) {
        super(context);//, mHandle, mDialog);
    }

    /**
     * set print data
     */
    public ArrayList<String> getFiles() {
        return mImageFiles;
    }

    /**
     * set print data
     */
    public void setFiles(ArrayList<String> files) {
        mImageFiles = files;
    }

    /**
     * do the particular print
     */
    @Override
    protected void doPrint() {
        int count = mImageFiles.size();

        for (int i = 0; i < count; i++) {

            String strFile = mImageFiles.get(i);
            Log.wtf("testprint","file to print:"+strFile);
            mPrintResult = mPrinter.printFile(strFile);
            Log.wtf("testprint","testprint7");
            // if error, stop print next files
            if (mPrintResult.errorCode != ErrorCode.ERROR_NONE) {
                Log.wtf("testprint","testprint8");
                Log.wtf("testprint","error code:"+mPrintResult.errorCode);


                break;
            }
        }
    }

}