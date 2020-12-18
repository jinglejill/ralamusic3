//
//  ConnectBrotherPrinter.m
//  ralamusic3
//
//  Created by Thidaporn Kijkamjai on 12/10/2563 BE.
//

#import "ConnectBrotherPrinter.h"
#import <React/RCTLog.h>
#import <BRLMPrinterKitW/BRLMPrinterKit.h>
#import <BRLMPrinterKitW/BRLMPrintImageSettings.h>
#import <BRLMPrinterKitW/BRLMPrinterDriver.h>


@implementation ConnectBrotherPrinter
RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(testLog:(NSString *)imageFileName location:(NSString *)location)
{
//  RCTLogInfo(@"Pretending to write log name %@ at %@", name, location);
}

RCT_EXPORT_METHOD(testCallBack:(RCTResponseSenderBlock)callback)
{

//  RCTLogInfo(@"log call callback method");
//  callback(@[[NSNull null], @"callback por"]);
  
  self.callback = callback;
  NSMutableArray *printerList = [[NSMutableArray alloc]init];
  {
    NSMutableDictionary *dic = [[NSMutableDictionary alloc]init];
    [dic setValue:@"aaa" forKey:@"model"];
    [dic setValue:@"100.100.100.100" forKey:@"ipAddress"];
    [printerList addObject:dic];
  }
  {
    NSMutableDictionary *dic = [[NSMutableDictionary alloc]init];
    [dic setValue:@"bbb" forKey:@"model"];
    [dic setValue:@"100.100.100.200" forKey:@"ipAddress"];
    [printerList addObject:dic];
  }
  self.callback(@[[NSNull null], printerList]);
}

RCT_EXPORT_METHOD(setAutoCut:(NSString *)autoCut)
{
  [[NSUserDefaults standardUserDefaults] setValue:autoCut forKey:@"autoCut"];
}

RCT_EXPORT_METHOD(setCutAtEnd:(NSString *)cutAtEnd)
{
  [[NSUserDefaults standardUserDefaults] setValue:cutAtEnd forKey:@"cutAtEnd"];
}

RCT_EXPORT_METHOD(setModel:(NSString *)model)
{
  [[NSUserDefaults standardUserDefaults] setValue:model forKey:@"model"];
}

RCT_EXPORT_METHOD(setOrientation:(NSString *)orientation)
{
  [[NSUserDefaults standardUserDefaults] setValue:orientation forKey:@"orientation"];
}

RCT_EXPORT_METHOD(setPaperSize:(NSString *)paperSize)
{
  [[NSUserDefaults standardUserDefaults] setValue:paperSize forKey:@"paperSize"];
}

RCT_EXPORT_METHOD(setIPAddress:(NSString *)ipAddress)
{
  [[NSUserDefaults standardUserDefaults] setValue:ipAddress forKey:@"ipAddress"];
}

RCT_EXPORT_METHOD(getAutoCut:(RCTResponseSenderBlock)callback)
{
  NSString *autoCut = [[NSUserDefaults standardUserDefaults] stringForKey:@"autoCut"];
  if(!autoCut)
  {
    autoCut = @"YES";
  }
  RCTLogInfo(@"autoCut: %@",autoCut);
  callback(@[[NSNull null], autoCut]);
}

RCT_EXPORT_METHOD(getCutAtEnd:(RCTResponseSenderBlock)callback)
{
  NSString *cutAtEnd = [[NSUserDefaults standardUserDefaults] stringForKey:@"cutAtEnd"];
  if(!cutAtEnd)
  {
    cutAtEnd = @"YES";
  }
  RCTLogInfo(@"cutAtEnd: %@",cutAtEnd);
  callback(@[[NSNull null], cutAtEnd]);
}

RCT_EXPORT_METHOD(getModel:(RCTResponseSenderBlock)callback)
{
  NSString *model = [[NSUserDefaults standardUserDefaults] stringForKey:@"model"];
  if(!model)
  {
    model = @"";
  }
  RCTLogInfo(@"model: %@",model);
  callback(@[[NSNull null], model]);
}

RCT_EXPORT_METHOD(getOrientation:(RCTResponseSenderBlock)callback)
{
  NSString *orientation = [[NSUserDefaults standardUserDefaults] stringForKey:@"orientation"];
  if(!orientation)
  {
    orientation = @"Portrait";
  }
  RCTLogInfo(@"orientation: %@",orientation);
  callback(@[[NSNull null], orientation]);
}

RCT_EXPORT_METHOD(getPaperSize:(RCTResponseSenderBlock)callback)
{
  NSString *paperSize = [[NSUserDefaults standardUserDefaults] stringForKey:@"paperSize"];
  if(!paperSize)
  {
    paperSize = @"";
  }
  RCTLogInfo(@"paperSize: %@",paperSize);
  callback(@[[NSNull null], paperSize]);
}

RCT_EXPORT_METHOD(getIPAddress:(RCTResponseSenderBlock)callback)
{
  NSString *ipAddress = [[NSUserDefaults standardUserDefaults] stringForKey:@"ipAddress"];
  if(!ipAddress)
  {
    ipAddress = @"";
  }
  RCTLogInfo(@"ipAddress: %@",ipAddress);
  callback(@[[NSNull null], ipAddress]);
}

//- (void)startSearchWiFiPrinter
RCT_EXPORT_METHOD(startSearchWiFiPrinter:(RCTResponseSenderBlock)callback)
{
  self.callback = callback;
    self.networkManager = [BRPtouchNetworkManager new];
    self.networkManager.delegate = self;
//  [self.networkManager setPrinterName:@"Brother QL-720NW"];
    [self.networkManager startSearch:5];
  RCTLogInfo(@"start search wifi printer");
}

// BRPtouchNetworkDelegate
- (void)didFinishSearch:(BRPtouchNetworkManager *)manager
{
  NSLog(@"didFinishSearch");
    NSMutableArray *printerList = [[NSMutableArray alloc]init];
    NSArray<BRPtouchDeviceInfo *> *devices = [manager getPrinterNetInfo];
    for (BRPtouchDeviceInfo *deviceInfo in devices)
    {
      NSMutableDictionary *dic = [[NSMutableDictionary alloc]init];
      [dic setValue:deviceInfo.strModelName forKey:@"model"];
      [dic setValue:deviceInfo.strIPAddress forKey:@"ipAddress"];
      [printerList addObject:dic];
      NSLog(@"Model: %@, IP Address: %@", deviceInfo.strModelName, deviceInfo.strIPAddress);
    }
    self.callback(@[[NSNull null], printerList]);
}

//- (void)printImage
RCT_EXPORT_METHOD(printImage:(NSString *)imageFileName quantity:(NSInteger)quantity callback:(RCTResponseSenderBlock)callback)
{
    NSString *ipAddress = [[NSUserDefaults standardUserDefaults] stringForKey:@"ipAddress"];
  NSLog(@"ipAddress: %@",ipAddress);
  
    NSString *model = [[NSUserDefaults standardUserDefaults] stringForKey:@"model"];
  NSLog(@"model: %@",model);
    BRLMPrinterModel printerModel;
    if([model isEqualToString:@"QL-720NW"])
    {
      printerModel = BRLMPrinterModelQL_720NW;
    }
    else if([model isEqualToString:@"QL-820NWB"])
    {
      printerModel = BRLMPrinterModelQL_820NWB;
    }
    else
    {
      printerModel = BRLMPrinterModelQL_720NW;
    }
  
    NSString *paperSize = [[NSUserDefaults standardUserDefaults] stringForKey:@"paperSize"];
    NSLog(@"paperSize: %@",paperSize);
  
    NSInteger labelSize;
    if([paperSize isEqualToString:@"W29"])
    {
      labelSize = BRLMQLPrintSettingsLabelSizeRollW29;
    }
    else if([paperSize isEqualToString:@"W62"])
    {
      labelSize = BRLMQLPrintSettingsLabelSizeRollW62;
    }
    else if([paperSize isEqualToString:@"W62H29"])
    {
      labelSize = BRLMQLPrintSettingsLabelSizeDieCutW62H29;
    }
    else
    {
      labelSize = BRLMQLPrintSettingsLabelSizeRollW62;
    }
    
    BRLMChannel *channel = [[BRLMChannel alloc] initWithWifiIPAddress:ipAddress];

    BRLMPrinterDriverGenerateResult *driverGenerateResult = [BRLMPrinterDriverGenerator openChannel:channel];
    if (driverGenerateResult.error.code != BRLMOpenChannelErrorCodeNoError ||
        driverGenerateResult.driver == nil) {
        NSLog(@"%@", @(driverGenerateResult.error.code));
        return;
    }


    BRLMPrinterDriver *printerDriver = driverGenerateResult.driver;

    BRLMQLPrintSettings *qlSettings = [[BRLMQLPrintSettings alloc] initDefaultPrintSettingsWithPrinterModel:printerModel];
    qlSettings.labelSize = labelSize;
  
  
    //*****orientation
    NSString *strOrientation = [[NSUserDefaults standardUserDefaults] stringForKey:@"orientation"];
  NSLog(@"orientation: %@",strOrientation);
    BRLMPrintSettingsOrientation orientation;
    if([strOrientation isEqualToString:@"Portrait"])
    {
      orientation = BRLMPrintSettingsOrientationPortrait;
    }
    else if([strOrientation isEqualToString:@"Landscape"])
    {
      orientation = BRLMPrintSettingsOrientationLandscape;
    }
    else
    {
      orientation = BRLMPrintSettingsOrientationPortrait;
    }
    qlSettings.printOrientation = orientation;
    //*****orientation
  
  
    //*****autoCut
    NSString *strAutoCut = [[NSUserDefaults standardUserDefaults] stringForKey:@"autoCut"];
  NSLog(@"autoCut: %@",strAutoCut);
    bool autoCut;
    if([strAutoCut isEqualToString:@"YES"])
    {
      autoCut = YES;
    }
    else if([strAutoCut isEqualToString:@"NO"])
    {
      autoCut = NO;
    }
    else
    {
      autoCut = YES;
    }
    qlSettings.autoCut = autoCut;
    //*****autoCut
  
  
    //*****cutAtEnd
    NSString *strCutAtEnd = [[NSUserDefaults standardUserDefaults] stringForKey:@"cutAtEnd"];
  NSLog(@"cutAtEnd: %@",strCutAtEnd);
    bool cutAtEnd;
    if([strCutAtEnd isEqualToString:@"YES"])
    {
      cutAtEnd = YES;
    }
    else if([strCutAtEnd isEqualToString:@"NO"])
    {
      cutAtEnd = NO;
    }
    else
    {
      cutAtEnd = YES;
    }
    qlSettings.cutAtEnd = cutAtEnd;
    //*****autoCut
  
//  callback(@[[NSNull null], @"test"]);
//  return;
  
  
  //    NSURL *url = [[NSBundle mainBundle] URLForResource:imageFileName withExtension:imageExtension];
  //    BRLMPrintError *printError = [printerDriver printImageWithURL:url settings:qlSettings];
  
  
    UIImage *image = [[UIImage alloc] initWithContentsOfFile:imageFileName];
    CGImageRef imageRef = image.CGImage;
    
    for(int i=0; i<quantity; i++)
    {
      BRLMPrintError *printError = [printerDriver printImageWithImage:imageRef settings:qlSettings];
      
      if (printError.code != BRLMPrintErrorCodeNoError)
      {
          NSString *error = [NSString stringWithFormat:@"Error - Print Image: %@", @(printError.code)];
          NSLog(@"%@", error);
          callback(@[[NSNull null], error]);
        return;
      }
      else
      {
          NSLog(@"Success - Print Image");
      }
    }
  
  
    [printerDriver closeChannel];
  
    callback(@[[NSNull null], @""]);
}

//- (NSString *)getPrinterStatus
RCT_EXPORT_METHOD(getPrinterStatusIOSCallback:(RCTResponseSenderBlock)callback)
{
  NSString* ipAddress = [[NSUserDefaults standardUserDefaults] stringForKey:@"ipAddress"];
//  NSString *status = @"";
  if(!ipAddress)
  {
    RCTLogInfo(@"ip address null");
    callback(@[[NSNull null], @"IP Address not set"]);
    return;
  }
  
  BRLMChannel *channel = [[BRLMChannel alloc] initWithWifiIPAddress:ipAddress];

  BRLMPrinterDriverGenerateResult *driverGenerateResult = [BRLMPrinterDriverGenerator openChannel:channel];
  if (driverGenerateResult.error.code != BRLMOpenChannelErrorCodeNoError ||
      driverGenerateResult.driver == nil)
  {
      NSLog(@"%@", @(driverGenerateResult.error.code));
      callback(@[[NSNull null], @"Not connected"]);
      return;
  }

  NSLog(@"start printer driver");
  BRLMPrinterDriver *printerDriver = driverGenerateResult.driver;
  BRLMGetPrinterStatusResult *printerStatusResult = printerDriver.getPrinterStatus;
  
  if(!printerStatusResult.status)
  {
    NSLog(@"printer status error code: %ld",printerStatusResult.error.code);
    switch (printerStatusResult.error.code) {
      case 0:
//        status = @"";//@"no error";
        break;
      case 1:
        callback(@[[NSNull null], @"Printer not found"]);
        return;
        break;
      case 2:
        callback(@[[NSNull null], @"Timeout"]);
        return;
        break;
      default:
        break;
    }
  }
  else
  {
    NSLog(@"printerStatusResult.status has value");
//    status = @"";
  }
  
  [printerDriver closeChannel];
  
  callback(@[[NSNull null], @""]);
}
@end
