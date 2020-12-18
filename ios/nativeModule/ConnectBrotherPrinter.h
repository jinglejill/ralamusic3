//
//  ConnectBrotherPrinter.h
//  ralamusic3
//
//  Created by Thidaporn Kijkamjai on 12/10/2563 BE.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <BRLMPrinterKitW/BRPtouchNetworkManager.h>


NS_ASSUME_NONNULL_BEGIN

@interface ConnectBrotherPrinter : NSObject<RCTBridgeModule,BRPtouchNetworkDelegate>
@property (nonatomic, strong) BRPtouchNetworkManager *networkManager;
@property (nonatomic) RCTResponseSenderBlock callback;
@end

NS_ASSUME_NONNULL_END
