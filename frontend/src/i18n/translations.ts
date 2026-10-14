export type Language = "en" | "am";

export interface Translations {
  [key: string]: string | Translations;
}

export const translations: Record<Language, Translations> = {
  en: {
    // Navigation
    nav: {
      brandName: "UniqueLow",
      brandTag: "Auction",
      platformSubtitle: "Lowest Unique Bid Platform",
      liveAuctions: "Live Auctions",
      howItWorks: "How It Works",
      postItem: "Post Item (1,000 ETB)",
      sellerHub: "Seller Hub",
      myListedItems: "My Listed Items & Payouts",
      walletBalance: "Wallet Balance",
      topUp: "Top Up",
      topUpBalance: "Top Up Wallet Balance",
      logIn: "Log In",
      signUp: "Sign Up",
      signOut: "Sign Out",
      adminPortal: "Admin Portal",
      demoProfiles: "Demo Profiles",
      instantLogin: "Instant 1-Click Login",
      selectLang: "Language",
      english: "English",
      amharic: "አማርኛ (Amharic)",
    },

    // Home / Catalog
    home: {
      heroBadge: "100% Certified Lowest Unique Bid Protocol",
      heroTitlePrefix: "Bid Smart.",
      heroTitleHighlight: "Win Exclusive",
      heroTitleSuffix: "Products for Fractions of Retail.",
      heroSubtitle:
        "Place secret blind bids on factory-sealed electronics, luxury watches, and consoles. The lowest bid that NO ONE else matches wins!",
      statsActive: "Active Auctions",
      statsBids: "Total Bids Placed",
      statsVerified: "100% Brand New",
      statsFair: "Blind & Fair Algorithm",
      searchPlaceholder: "Search brand new items by title or category...",
      categoryAll: "All Categories",
      categoryElectronics: "Electronics",
      categoryGaming: "Gaming",
      categoryAudio: "Audio",
      categoryComputers: "Computers",
      filterAll: "All Auctions",
      filterActive: "Active Now",
      filterClosed: "Recently Closed",
      noAuctionsFound: "No auctions found matching your filter criteria.",
      resetFilters: "Reset Filters",
      howItWorksCta: "See How Bidding Works",
    },

    // Auction Card
    card: {
      brandNew: "Brand New Sealed",
      retailValue: "Retail Value",
      entryFee: "Entry Fee",
      registeredBidders: "Registered",
      timeLeft: "Time Left",
      ended: "Auction Ended",
      viewAuction: "View & Bid",
      winnerDeclared: "Winner Declared",
      winningBid: "Winning Bid",
      closedNoWinner: "Closed (No Winner)",
      sellerCommunity: "Community Seller",
    },

    // How It Works Modal
    howItWorks: {
      title: "How Lowest Unique Bid Auctions Work",
      subtitle:
        "Unlike standard auctions where the highest bid wins, here the lowest bid that nobody else duplicated takes home the item!",
      step1Title: "1. Register & Pay Entry Fee",
      step1Desc:
        "Deposit wallet funds using Telebirr and pay a nominal registration fee to unlock access to the auction floor.",
      step2Title: "2. Place One Secret Bid",
      step2Desc:
        "Enter your secret price (e.g. 0.45 ETB). All bids are 100% blind and invisible to all other participants until the countdown ends.",
      step3Title: "3. Lowest Unique Bid Wins",
      step3Desc:
        "When time expires, the system finds the lowest number placed by exactly ONE bidder. If you hold that unique number, you purchase the item for that exact pocket-change amount!",
      singleBidTitle: "Strict Single Bid Rule",
      singleBidDesc:
        "Each registered bidder can place exactly 1 bid per auction. This guarantees absolute equality and makes spamming or brute-force bidding mathematically impossible.",
      tiedTitle: "Tie Protection & Fairness",
      tiedDesc:
        "If every placed bid is tied with another, the auction concludes cleanly with no winner, ensuring pure mathematical integrity.",
      sellerRulesTitle: "Selling on HowLow: 60% Seller / 40% Platform Rules",
      ruleListingFee:
        "1,000 ETB Listing Fee: Paid upfront upon submission (non-refundable).",
      ruleBrandNew:
        "100% Brand New Condition: Must be factory sealed and genuine. Non-matching items result in immediate cancellation and forfeiture of the 1,000 ETB fee.",
      ruleSplit:
        "60% / 40% Revenue Split: 60% of all gross auction revenue is directly credited to your wallet upon conclusion.",
      ruleReview:
        "Admin Review: Every submitted item is verified by staff before going live.",
      ruleAntiShill:
        "Anti-Shill Guarantee: Sellers are strictly prohibited from bidding on their own listings.",
      closeButton: "Got it, Let's Play!",
    },

    // User Post Item / Seller Hub
    postItem: {
      hubTitle: "Community Seller Hub",
      hubSubtitle:
        "List your authentic, brand-new items for lowest-unique bidding. Earn 60% of all gross auction revenue credited automatically to your wallet upon completion.",
      rule1Tag: "Rule 1",
      rule1Title: "1,000 ETB Listing Fee",
      rule1Desc: "Non-refundable submission fee",
      rule2Tag: "Rule 2",
      rule2Title: "100% Brand New",
      rule2Desc: "Sealed & authentic match",
      rule3Tag: "Rule 3",
      rule3Title: "Zero Tolerance",
      rule3Desc: "Counterfeit = fee forfeit",
      rule4Tag: "Rule 4",
      rule4Title: "60% / 40% Profit Split",
      rule4Desc: "60% Seller / 40% Platform",
      tabCreate: "Post New Item (1,000 ETB)",
      tabMyItems: "My Listed Items & Earnings",
      formTitle: "Item Specifications",
      formSubtitle: "Ensure all information is accurate and verifiable",
      samplePresets: "Quick Sample Presets (Click to Auto-Fill):",
      itemTitleLabel: "Item Title *",
      itemTitlePlaceholder: "e.g. Sony WH-1000XM5 Wireless Headphones - Silver",
      retailPriceLabel: "Authentic Retail Value (ETB) *",
      entryFeeLabel: "Bidder Registration / Entry Fee (ETB) *",
      imageUrlLabel: "High-Resolution Image URL *",
      imagePreview: "Verified Image Preview",
      durationLabel: "Auction Duration *",
      descriptionLabel: "Detailed Item Description *",
      authenticityLabel: "Authenticity & Condition Declaration *",
      authenticityPlaceholder:
        "Describe packaging seals, serial numbers, warranty status, and store receipt...",
      termsHeader: "Mandatory Seller Declarations & Legal Acknowledgments",
      termBrandNew:
        "I declare and guarantee that this item is 100% BRAND NEW, factory-sealed, genuine, and pristine.",
      termFeeNonRefundable:
        "I acknowledge that the 1,000 ETB listing submission fee is strictly NON-REFUNDABLE once submitted.",
      termFraudLoss:
        "Zero Tolerance Policy: Discrepancy from factory new condition will result in immediate cancellation and total forfeiture of the 1,000 ETB fee.",
      termProfitSplit:
        "Profit Split Agreement: I agree to the platform 60% seller payout / 40% system share model.",
      submitBtn: "Submit Item • Pay 1,000 ETB Listing Fee",
      submittingBtn: "Submitting & Deducting 1,000 ETB...",
      reviewNotice:
        "Admin will review condition & specs within 2 hours before publishing to live catalog.",
      calcTitle: "Revenue & Net Profit Calculator",
      calcSubtitle:
        "Live simulation based on the 60% Seller / 40% Platform revenue split rule.",
      calcRetailCost: "Item Retail Value:",
      calcListingFee: "Listing Submission Fee:",
      calcTotalCost: "Total Seller Cost:",
      calcSimulatedBidders: "Simulated Bidders",
      btnBreakeven: "Breakeven",
      btnTarget: "Target (+25%)",
      btnHigh: "High (+50%)",
      calcEntryFee: "Entry Fee:",
      calcGrossPool: "Gross Auction Pool:",
      calcSellerPayout: "Your 60% Payout",
      calcSystemShare: "System 40% Share",
      calcNetProfit: "Estimated Net Profit",
      calcShortfall: "Projected Shortfall",
      calcNetProfitNote:
        "Net profit after recovering both your item value and 1,000 ETB listing fee.",
      calcShortfallNote:
        "Requires more bidders to break even on item cost and listing fee.",
      calcFormula:
        "Formula: 60% Payout − Item Cost − Listing Fee (1,000 ETB) = Net Profit.",
      myItemsHeader: "My Listed Items & Performance",
      noItemsTitle: "No Items Listed Yet",
      noItemsDesc:
        "You haven't submitted any items for auction yet. Submit your first item with a 1,000 ETB listing fee and earn 60% of all generated auction revenue!",
      statusPending: "Pending Admin Approval",
      statusActive: "Live Active Auction",
      statusClosed: "Closed & Settled",
      statusCancelled: "Cancelled / Forfeited",
    },

    // Auction Detail & Bid View
    auctionDetail: {
      backToCatalog: "Back to Catalog",
      backToAuctions: "Back to Live Auctions",
      statusActive: "Live & Accepting Bids",
      statusClosed: "Auction Settled",
      statusNoWinner: "No Winner (All Bids Tied)",
      statusCancelled: "Auction Cancelled",
      endsIn: "Time Remaining",
      singleBidBadge: "Single Bid Rule Active",
      specsTitle: "Item Specifications",
      retailValueLabel: "Retail Value:",
      registrationFeeLabel: "Registration Entry Fee:",
      totalRegisteredLabel: "Registered Participants:",
      totalBidsPlacedLabel: "Blind Bids Placed:",
      sellerNameLabel: "Listed By:",
      communitySellerTag: "Community Verified Seller",
      communitySellerPrefix: "Community Seller: @{seller}",
      officialItemBadge: "Official UniqueLow Item",
      brandNewBadge: "100% Brand New - Guaranteed",
      authenticityLabel: "Authenticity & Condition Declaration:",
      entryFeeMetric: "Entry Fee",
      biddersMetric: "Bidders",
      totalBidsMetric: "Total Bids",
      privacyNote:
        "Blind Bidding Privacy: All bids are encrypted and blind until auction resolution. No competitor can see your bids.",
      winnerOfficialTitle: "Official Winner Declared",
      winnerWonWith: "Won with the Lowest Unique Bid of {amount} ETB",
      winnerSavingsTitle: "Total Savings",
      winnerSavingsOff: "{percent}% OFF",
      winnerSavedAmount: "Saved {amount} ETB",
      winnerLinqNotice:
        "Transparent resolution completed. All duplicate bids were eliminated.",
      viewDistribution: "View Bid Distribution",
      noWinnerFoundTitle: "No Lowest Unique Bid Found",
      noWinnerFoundDesc:
        "Every bid placed on this auction was duplicated by two or more bidders. The auction concluded with no winner.",
      loginToParticipateTitle: "Log In to Participate in this Auction",
      loginToParticipateDesc:
        "Sign in or create a free bidder account (100 ETB starting bonus included) to register and place secret lowest-unique bids.",
      signInToBidBtn: "Sign In to Bid",
      createAccountBonusBtn: "Create Account & Get 100 ETB",
      adminViewModeTitle: "Admin Viewing Mode",
      adminRestrictedBadge: "Bidding Restricted",
      adminRestrictedDesc:
        "Administrators are prohibited from participating or placing bids in auctions to guarantee protocol fairness and prevent conflict of interest.",
      adminSwitchNotice:
        "To test bidding, switch to a standard bidder persona via the top-right persona switcher.",
      adminManageBtn: "Manage in Admin Portal",
      sellerDashboardTitle: "You Listed This Auction",
      sellerDashboardBadge: "Seller Dashboard (60% Profit)",
      sellerDashboardDesc:
        "Anti-Shill Protection: Sellers cannot bid on their own auctions to guarantee fairness. Your 60% revenue share will automatically credit to your wallet when resolved!",
      listingFeePaid: "Listing Fee Paid",
      sellerPayoutProjected: "Your 60% Payout",
      systemCutProjected: "System 40% Cut",
      sellerRegisteredSummary:
        "Total {registered} bidders registered • {bids} blind bids",
      manageAllItemsLink: "Manage All Your Items",
      unlockAccessTitle: "Unlock Bidding Access",
      unlockAccessDesc:
        "Pay the nominal registration fee to participate in blind bidding",
      yourWalletBalance: "Your Wallet Balance",
      payAndRegister: "Pay {fee} ETB & Register",
      processingRegistration: "Processing registration...",
      topUpWalletBtn: "Top Up Wallet",
      secretBidSubmittedTitle: "Secret Bid Submitted",
      oneBidLimitReached: "1 Bid Limit Reached",
      yourSealedBid: "Your Sealed Secret Bid",
      protocolStatus: "Protocol Status",
      blindEncrypted: "Blind & Encrypted",
      singleBidRuleNotice:
        "Single Bid Rule: Under this auction protocol, each registered bidder is limited to 1 bid per auction to ensure absolute fairness and strategic integrity. Your bid is securely locked until the auction ends.",
      submitBlindBidTitle: "Submit Secret / Blind Bid",
      oneBidAvailable: "1 Bid Available",
      bidAmountLabel: "Bid Amount (ETB)",
      oneBidLimitTag: "1 Bid per Bidder Limit",
      singleBidRuleReminder:
        "Rule: You may only place 1 bid for this entire auction. Choose carefully!",
      quickSuggestions: "Quick suggestions:",
      submitSecretBidBtn: "Submit My Secret Bid ({amount} ETB)",
      encryptingBid: "Encrypting & placing single bid...",
      myBidsTitle: "My Bids in This Auction ({count})",
      personaLabel: "Persona:",
      placedAtTime: "Placed {time}",
      winningBidTag: "Winning Bid!",
      uniqueTag: "Unique",
      duplicateTag: "Duplicate (Cancelled)",
      blindSecretTag: "Blind / Secret",
      noBidsPlacedYet:
        "No bids placed yet. Submit your first blind bid above!",
      registerToBidPrompt:
        "Register for this auction to start placing blind bids.",
      biddingBoxTitle: "Place Your Secret Blind Bid",
      biddingBoxDesc:
        "Enter your secret amount. All bids remain completely invisible to other participants until the countdown ends.",
      registerRequired:
        "You must register and pay the entry fee to participate in this auction.",
      payAndRegisterBtn: "Pay Entry Fee & Register",
      registeredActiveNotice: "You are registered! Enter your 1 allowed bid:",
      bidInputPlaceholder: "e.g. 0.45",
      placeBidBtn: "Lock In Secret Bid",
      bidLockedTitle: "Your Secret Bid is Locked!",
      bidLockedDesc:
        "You placed {amount} ETB. Under the single-bid rule, your choice is securely locked until the countdown finishes.",
      closedWinnerBanner: "Auction Winner Identified!",
      closedWinnerDesc:
        "{username} won this auction with the lowest unique bid of {amount} ETB!",
      tiedNotice:
        "Every bid on this auction had duplicates! No lowest unique bid existed.",
      liveStreamTitle: "Blind Bidding Activity",
      liveStreamNotice:
        "Bid values remain masked until auction resolution for complete integrity.",
    },

    // Wallet & Telebirr Top-Up
    wallet: {
      modalTitle: "Telebirr Wallet Deposit",
      modalSubtitle:
        "Transfer funds via Telebirr mobile money to top up your HowLow auction balance.",
      depositFunds: "Deposit Funds",
      requestStatus: "Request Status",
      balanceLabel: "Balance:",
      timeLimit: "Time limit",
      timeLimitDesc:
        "Before creating a request, transfer funds within 10 minutes using the payment details provided below.",
      step1: "1. Open Telebirr app on your phone",
      step2: "2. Send funds to the platform merchant account below",
      step3: "3. Copy the SMS Transaction ID and submit it below for credit",
      merchantAccount: "Telebirr Agent / Merchant Account",
      accountName: "Account Name",
      accountNumber: "Phone / Account Number",
      amountRange: "Amount (Min 50.00 ETB / Max 15,000.00 ETB):",
      amountLabel: "Deposit Amount (ETB) *",
      selectAmount: "Please enter or select your deposit amount",
      yourPhone: "Your Telebirr Phone Number:",
      senderPhoneLabel: "Your Sender Telebirr Phone Number *",
      senderPhonePlaceholder: "09XXXXXXXX or 07XXXXXXXX",
      txNumberLabel: "Telebirr Transaction Number (TXN ID) *",
      txNumberPlaceholder: "e.g. CI9483726190 or 10-digit SMS code",
      fromTelebirrSms: "From Telebirr SMS",
      smsHelp:
        "After completing the transfer in your Telebirr app, enter the transaction number here and submit for administrator verification.",
      submitRequestBtn: "Submit Deposit for Approval",
      submittingRequest: "Verifying & Submitting...",
      recentRequests: "Your Top-Up History",
      noRequestsYet: "No top-up requests yet.",
      statusPending: "Pending Verification",
      statusApproved: "Approved & Credited",
      statusRejected: "Rejected",
      requestSubmittedTitle: "Top-Up Request Submitted & Pending Approval!",
      requestSubmittedDesc:
        "Your request of {amount} ETB with Transaction Number {txn} has been recorded. An administrator will verify the Telebirr transfer and credit your wallet.",
      trackStatus: "Track Status in Requests",
      newRequest: "New Request",
      refreshBtn: "Refresh",
      instantNotice:
        "Admins verify Telebirr SMS receipts within minutes. Approved funds are instantly available for registration fees and bidding.",
      closeBtn: "Close",
    },

    // Auth (Login / SignUp)
    auth: {
      loginTitle: "Sign In to Your Account",
      loginSubtitle:
        "Access your wallet, track active blind bids, and participate in auctions",
      signupTitle: "Create an Account",
      signupSubtitle:
        "Join UniqueLow to place secret bids and win premium auctions",
      usernameLabel: "Username",
      usernamePlaceholder: "Enter your username",
      emailLabel: "Email Address",
      emailPlaceholder: "you@example.com",
      phoneLabel: "Telebirr Phone Number / የስልክ ቁጥር",
      phonePlaceholder: "09XXXXXXXX or 07XXXXXXXX",
      phoneHelp: "Required for Telebirr wallet deposits and payout verification.",
      passwordLabel: "Password",
      passwordPlaceholder: "At least 6 characters",
      confirmPasswordLabel: "Confirm Password",
      accountTypeLabel: "Account Type",
      roleUser: "Bidder (Standard)",
      roleAdmin: "Admin (Manager)",
      bonusBadge: "100.00 ETB Starting Wallet Bonus",
      bonusDesc:
        "Every newly registered account automatically receives 100 ETB starting wallet funds.",
      signInBtn: "Sign In",
      signUpBtn: "Create Account",
      alreadyHaveAccount: "Already have an account?",
      dontHaveAccount: "Don't have an account?",
      quickProfilesHeader: "Instant Evaluator & Testing Accounts",
      quickProfilesSubtitle:
        "1-click login for test profiles (2 Admins & 5 Users)",
    },

    // Footer
    footer: {
      copyright: "Unique Low Auction Protocol",
      algorithm: "Guaranteed Lowest Unique Bid Algorithm",
      fairness: "100% Blind & Provably Fair",
      catalog: "Catalog",
      adminPortal: "Admin Portal",
    },
  },

  am: {
    // Navigation
    nav: {
      brandName: "ዩኒክ ሎው",
      brandTag: "ጨረታ",
      platformSubtitle: "ዝቅተኛ ብቸኛ ጨረታ መድረክ",
      liveAuctions: "የቀጥታ ጨረታዎች",
      howItWorks: "እንዴት ይሰራል?",
      postItem: "ዕቃ ይለጥፉ (1,000 ብር)",
      sellerHub: "የሻጮች ማዕከል",
      myListedItems: "የለጠፍኳቸው ዕቃዎችና ገቢዬ",
      walletBalance: "የዋሌት ሂሳብ",
      topUp: "ገንዘብ ሙላ",
      topUpBalance: "ዋሌት በቴሌብር ይሙሉ",
      logIn: "ግባ",
      signUp: "ተመዝገብ",
      signOut: "ውጣ",
      adminPortal: "የአድሚን ገጽ",
      demoProfiles: "የሙከራ መለያዎች",
      instantLogin: "በአንድ ጠቅታ ፈጣን መግቢያ",
      selectLang: "ቋንቋ",
      english: "English",
      amharic: "አማርኛ",
    },

    // Home / Catalog
    home: {
      heroBadge: "100% የተረጋገጠ ዝቅተኛ ብቸኛ ጨረታ ስርዓት",
      heroTitlePrefix: "በጥበብ ይጫረቱ።",
      heroTitleHighlight: "ውድ እቃዎችን",
      heroTitleSuffix: "በጥቂት ሳንቲሞች ያሸንፉ።",
      heroSubtitle:
        "በአዳዲስ ኤሌክትሮኒክስ፣ ሰዓቶች እና ጌሞች ላይ ሚስጥራዊ ጨረታ ያስገቡ። ማንም ያልደገመው ዝቅተኛው ዋጋ አሸናፊ ይሆናል!",
      statsActive: "ንቁ ጨረታዎች",
      statsBids: "የገቡ ጨረታዎች",
      statsVerified: "100% አዳዲስ እቃዎች",
      statsFair: "ፍትሃዊና ሚስጥራዊ አልጎሪዝም",
      searchPlaceholder: "እቃዎችን በስም ወይም በምድብ ይፈልጉ...",
      categoryAll: "ሁሉም ምድቦች",
      categoryElectronics: "ኤሌክትሮኒክስ",
      categoryGaming: "ጌሚንግ / ፕሌይስቴሽን",
      categoryAudio: "ኦዲዮ / የድምፅ እቃዎች",
      categoryComputers: "ኮምፒውተሮች",
      filterAll: "ሁሉም ጨረታዎች",
      filterActive: "አሁን የሚካሄዱ",
      filterClosed: "የተጠናቀቁ ጨረታዎች",
      noAuctionsFound: "ከፍለጋዎ ጋር የሚዛመድ ጨረታ አልተገኘም።",
      resetFilters: "ማጣሪያውን አጽዳ",
      howItWorksCta: "አሰራሩን ይመልከቱ",
    },

    // Auction Card
    card: {
      brandNew: "ሙሉ በሙሉ አዲስ (ያልተከፈተ)",
      retailValue: "የገበያ ዋጋ",
      entryFee: "የመግቢያ ክፍያ",
      registeredBidders: "ተሳታፊዎች",
      timeLeft: "የቀረ ጊዜ",
      ended: "ጨረታው ተጠናቋል",
      viewAuction: "ይመልከቱና ይጫረቱ",
      winnerDeclared: "አሸናፊ ተለይቷል",
      winningBid: "ያሸነፈው ዋጋ",
      closedNoWinner: "አሸናፊ የሌለው (እኩል)",
      sellerCommunity: "የማህበረሰብ ሻጭ",
    },

    // How It Works Modal
    howItWorks: {
      title: "ዝቅተኛ ብቸኛ ጨረታ እንዴት ይሰራል?",
      subtitle:
        "ከፍተኛ ዋጋ ከሚያሸንፍበት የተለመደ ጨረታ በተቃራኒ፣ እዚህ ማንም ያልደገመው ዝቅተኛው ብቸኛ ዋጋ እቃውን ይወስዳል!",
      step1Title: "1. ይመዝገቡና የመግቢያ ክፍያ ይክፈሉ",
      step1Desc:
        "በቴሌብር ዋሌትዎን ሞልተው አነስተኛ የመግቢያ ክፍያ በመክፈል የጨረታው ተሳታፊ ይሁኑ።",
      step2Title: "2. አንድ ሚስጥራዊ ዋጋ ያስገቡ",
      step2Desc:
        "የሚገምቱትን ዋጋ ያስገቡ (ለምሳሌ 0.45 ብር)። ጨረታው እስኪያበቃ ድረስ ማንም ሰው ያቀረቡትን ዋጋ ማየት አይችልም።",
      step3Title: "3. ዝቅተኛው ብቸኛ ጨረታ ያሸንፋል",
      step3Desc:
        "ጊዜው ሲያልቅ በአንድ ተጫራች ብቻ የቀረበው ዝቅተኛው ቁጥር አሸናፊ ይሆናል። እርስዎ ያቀረቡት ዋጋ ከሆነ እቃውን በዛች ሳንቲም ይወስዳሉ!",
      singleBidTitle: "የአንድ ጨረታ ጥብቅ ህግ",
      singleBidDesc:
        "ማንኛውም ተሳታፊ በአንድ ጨረታ ላይ ማስገባት የሚችለው በትክክል 1 ዋጋ ብቻ ነው። ይህ የሁሉም ተሳታፊዎችን እኩልነት ያረጋግጣል።",
      tiedTitle: "የእኩል ውጤት ጥበቃና ፍትሃዊነት",
      tiedDesc:
        "ሁሉም የገቡት ዋጋዎች በሌላ ሰው ከተደገሙ (ብቸኛ ቁጥር ከሌለ)፣ ጨረታው አሸናፊ እንደሌለው ሆኖ በፍትሃዊነት ይጠናቀቃል።",
      sellerRulesTitle: "በHowLow ላይ መሸጥ፡ የ60% ሻጭ / 40% ሲስተም ደንብ",
      ruleListingFee:
        "1,000 ብር የዝርዝር ክፍያ፡ እቃውን ሲያስገቡ የሚከፈል የማይመለስ ክፍያ።",
      ruleBrandNew:
        "100% ሙሉ በሙሉ አዲስ፡ እቃው በፋብሪካ ማሸጊያ የታሸገ መሆን አለበት። ካልተመሳሰለ ጨረታው ይሰረዛል፣ የ1000 ብር ክፍያውም ይወረሳል።",
      ruleSplit:
        "የ60% / 40% የትርፍ ክፍፍል፡ ጨረታው ሲያልቅ ከጠቅላላው የጨረታ ገቢ 60% በቀጥታ ወደ ዋሌትዎ ይገባል።",
      ruleReview:
        "የአድሚን ፍተሻ፡ እያንዳንዱ የተለጠፈ እቃ ለህዝብ ከመቅረቡ በፊት በአድሚኖች ይመረመራል።",
      ruleAntiShill:
        "የተከለከለ ጨረታ፡ ሻጮች በራሳቸው እቃ ላይ መጫረት በጥብቅ የተከለከለ ነው።",
      closeButton: "ገባኝ፣ እንጀምር!",
    },

    // User Post Item / Seller Hub
    postItem: {
      hubTitle: "የማህበረሰብ ሻጮች ማዕከል",
      hubSubtitle:
        "አዳዲስ እቃዎችዎን ለዝቅተኛ ብቸኛ ጨረታ ያቅርቡ። ጨረታው ሲጠናቀቅ ከጠቅላላው የጨረታ ገቢ 60% በቀጥታ ወደ ዋሌትዎ ገቢ ያድርጉ።",
      rule1Tag: "ደንብ 1",
      rule1Title: "1,000 ብር የዝርዝር ክፍያ",
      rule1Desc: "የማይመለስ የማስገቢያ ክፍያ",
      rule2Tag: "ደንብ 2",
      rule2Title: "100% ሙሉ በሙሉ አዲስ",
      rule2Desc: "የታሸገ እና ትክክለኛ እቃ",
      rule3Tag: "ደንብ 3",
      rule3Title: "ዜሮ መቻቻል",
      rule3Desc: "የተሳሳተ እቃ = ክፍያው ይወረሳል",
      rule4Tag: "ደንብ 4",
      rule4Title: "60% / 40% የትርፍ ክፍፍል",
      rule4Desc: "60% ለሻጭ / 40% ለስርዓቱ",
      tabCreate: "አዲስ እቃ ይለጥፉ (1,000 ብር)",
      tabMyItems: "የለጠፍኳቸው እቃዎችና ገቢዬ",
      formTitle: "የእቃው መረጃና ዝርዝር",
      formSubtitle: "እባክዎ ትክክለኛና የተረጋገጠ መረጃ ያስገቡ",
      samplePresets: "ፈጣን የናሙና እቃዎች (ይምረጡ)፦",
      itemTitleLabel: "የእቃው መጠሪያ ስም *",
      itemTitlePlaceholder: "ለምሳሌ፦ Sony WH-1000XM5 ገመድ አልባ ሄድፎን",
      retailPriceLabel: "ትክክለኛ የገበያ ዋጋ (ብር) *",
      entryFeeLabel: "የተጫራቾች መግቢያ ክፍያ (ብር) *",
      imageUrlLabel: "የእቃው ምስል ሊንክ (URL) *",
      imagePreview: "የምስል ቅድመ-እይታ",
      durationLabel: "የጨረታ ቆይታ ጊዜ *",
      descriptionLabel: "የእቃው ዝርዝር መግለጫ *",
      authenticityLabel: "የእቃው አዲስነትና ትክክለኛነት ማረጋገጫ *",
      authenticityPlaceholder:
        "የፋብሪካ ማሸጊያውን፣ ሲሪያል ነበሩን እና የዋስትና ካርዱን ሁኔታ ያብራሩ...",
      termsHeader: "ግዴታዎችና ህጋዊ ስምምነቶች",
      termBrandNew:
        "ይህ እቃ 100% ሙሉ በሙሉ አዲስ፣ በፋብሪካ የታሸገ እና ትክክለኛ መሆኑን አረጋግጣለሁ።",
      termFeeNonRefundable:
        "የ1,000 ብር የዝርዝር ክፍያው የማይመለስ መሆኑን ተረድቻለሁ።",
      termFraudLoss:
        "ዜሮ መቻቻል፡ እቃው ከተገለጸው ጋር ካልተዛመደ ጨረታው ወዲያውኑ ይሰረዛል፣ የ1000 ብር ክፍያውም ይወረሳል።",
      termProfitSplit:
        "የትርፍ ክፍፍል ስምምነት፡ 60% ለእኔ እንዲሁም 40% ለስርዓቱ ገቢ በሚሆነው የትርፍ ክፍፍል እስማማለሁ።",
      submitBtn: "እቃውን አስገባ • የ1,000 ብር ክፍያ ክፈል",
      submittingBtn: "በማስገባትና 1,000 ብር በመቀነስ ላይ...",
      reviewNotice:
        "እቃው ለህዝብ ከመቅረቡ በፊት በአድሚን በ2 ሰዓታት ውስጥ ይመረመራል።",
      calcTitle: "የገቢና የተጣራ ትርፍ ማስያ",
      calcSubtitle: "በ60% የሻጭ / 40% የሲስተም የትርፍ ድርሻ የተሰላ የቀጥታ ሲሙሌሽን።",
      calcRetailCost: "የእቃው የገበያ ዋጋ፦",
      calcListingFee: "የማስገቢያ ክፍያ፦",
      calcTotalCost: "ጠቅላላ የሻጭ ወጪ፦",
      calcSimulatedBidders: "የተገመቱ ተጫራቾች",
      btnBreakeven: "መካካሻ (ኪሳራ አልባ)",
      btnTarget: "ኢላማ (+25%)",
      btnHigh: "ከፍተኛ (+50%)",
      calcEntryFee: "የመግቢያ ክፍያ፦",
      calcGrossPool: "ጠቅላላ የጨረታ ገቢ፦",
      calcSellerPayout: "የእርስዎ 60% ድርሻ",
      calcSystemShare: "የስርዓቱ 40% ድርሻ",
      calcNetProfit: "የተገመተ የተጣራ ትርፍ",
      calcShortfall: "ያልተሟላ ጉድለት",
      calcNetProfitNote:
        "የእቃዎን ዋጋና የ1000 ብር ማስገቢያ ክፍያዎን ከመለሱ በኋላ የሚገኝ የተጣራ ትርፍ።",
      calcShortfallNote:
        "የእቃውን ዋጋና የ1000 ብር ክፍያውን ለመመለስ ተጨማሪ ተጫራቾች ያስፈልጋሉ።",
      calcFormula:
        "ቀመር፦ 60% ድርሻ − የእቃ ዋጋ − የ1000 ብር ክፍያ = የተጣራ ትርፍ።",
      myItemsHeader: "የለጠፍኳቸው እቃዎችና ሁኔታቸው",
      noItemsTitle: "እስካሁን ምንም እቃ አልለጠፉም",
      noItemsDesc:
        "እስካሁን ለጨረታ ያቀረቡት እቃ የለም። የመጀመሪያውን እቃ በ1,000 ብር ያስገቡና ከሚገኘው ገቢ 60% ተጠቃሚ ይሁኑ!",
      statusPending: "በአድሚን ፍተሻ ላይ",
      statusActive: "በጨረታ ላይ ያለ",
      statusClosed: "የተጠናቀቀና የተከፈለ",
      statusCancelled: "የተሰረዘ / የተወረሰ",
    },

    // Auction Detail & Bid View
    auctionDetail: {
      backToCatalog: "ወደ ካታሎግ ተመለስ",
      backToAuctions: "ወደ ቀጥታ ጨረታዎች ተመለስ",
      statusActive: "በቀጥታ በመካሄድ ላይ (ክፍት)",
      statusClosed: "ጨረታው ተጠናቋል",
      statusNoWinner: "አሸናፊ የሌለው (ሁሉም ተደግመዋል)",
      statusCancelled: "ጨረታው ተሰርዟል",
      endsIn: "የቀረው ጊዜ",
      singleBidBadge: "የ1 ጨረታ ህግ ንቁ ነው",
      specsTitle: "የእቃው መረጃና ዝርዝር",
      retailValueLabel: "የገበያ ዋጋ፦",
      registrationFeeLabel: "የመግቢያ ክፍያ፦",
      totalRegisteredLabel: "የተመዘገቡ ተጫራቾች፦",
      totalBidsPlacedLabel: "የገቡ ሚስጥራዊ ጨረታዎች፦",
      sellerNameLabel: "አቅራቢ ሻጭ፦",
      communitySellerTag: "የተረጋገጠ ማህበረሰብ ሻጭ",
      communitySellerPrefix: "የማህበረሰብ ሻጭ፦ @{seller}",
      officialItemBadge: "የUniqueLow ኦፊሴላዊ እቃ",
      brandNewBadge: "100% አዲስ እቃ - የተረጋገጠ",
      authenticityLabel: "የዕቃው ጥራትና ትክክለኛነት ማረጋገጫ፦",
      entryFeeMetric: "የመግቢያ ክፍያ",
      biddersMetric: "ተጫራቾች",
      totalBidsMetric: "ጠቅላላ ጨረታዎች",
      privacyNote:
        "የሚስጥራዊ ጨረታ ጥበቃ፦ ሁሉም ዋጋዎች ጨረታው እስኪያበቃ ድረስ የተመሰጠሩና ለማንም የማይታዩ ናቸው።",
      winnerOfficialTitle: "ይፋዊ የጨረታው አሸናፊ",
      winnerWonWith: "በ{amount} ብር ዝቅተኛ ብቸኛ ጨረታ አሸንፈዋል!",
      winnerSavingsTitle: "የተደረገ ቅናሽ",
      winnerSavingsOff: "{percent}% ቅናሽ",
      winnerSavedAmount: "{amount} ብር አትርፈዋል",
      winnerLinqNotice:
        "ግልጽ የመለየት ሂደት ተጠናቋል። ሁሉም የተደገሙ ዋጋዎች ተሰርዘዋል።",
      viewDistribution: "የጨረታውን ስርጭት ይመልከቱ",
      noWinnerFoundTitle: "ብቸኛ ዝቅተኛ ቁጥር አልተገኘም",
      noWinnerFoundDesc:
        "በዚህ ጨረታ ላይ የቀረቡት ሁሉም ዋጋዎች በሁለት ወይም ከዚያ በላይ ተጫራቾች ተደግመዋል። ጨረታው ያለምንም አሸናፊ ተጠናቋል።",
      loginToParticipateTitle: "በዚህ ጨረታ ለመሳተፍ ይግቡ",
      loginToParticipateDesc:
        "ሚስጥራዊ ዝቅተኛ ዋጋዎችን ለማስገባት ይግቡ ወይም አዲስ መለያ በ100 ብር ስጦታ ይፍጠሩ።",
      signInToBidBtn: "ለመጫረት ይግቡ",
      createAccountBonusBtn: "ተመዝግበው 100 ብር ያግኙ",
      adminViewModeTitle: "የአድሚን እይታ ሁኔታ",
      adminRestrictedBadge: "ጨረታ የተከለከለ",
      adminRestrictedDesc:
        "ፍትሃዊነትን ለማረጋገጥና የጥቅም ግጭትን ለማስወገድ አድሚኖች በጨረታ ላይ መሳተፍ አይችሉም።",
      adminSwitchNotice:
        "ጨረታን ለመሞከር ከላይ በቀኝ በኩል ካለው ዝርዝር ወደ መደበኛ ተጠቃሚ ይቀይሩ።",
      adminManageBtn: "በአድሚን ገጽ አስተዳድር",
      sellerDashboardTitle: "ይህን ጨረታ ያቀረቡት እርስዎ ነዎት",
      sellerDashboardBadge: "የሻጭ ዳሽቦርድ (60% ድርሻ)",
      sellerDashboardDesc:
        "የተከለከለ ጨረታ ህግ፡ ፍትሃዊነትን ለማረጋገጥ ሻጮች በራሳቸው እቃ ላይ መጫረት አይችሉም። ጨረታው ሲጠናቀቅ የ60% ድርሻዎ በቀጥታ ወደ ዋሌትዎ ይገባል!",
      listingFeePaid: "የተከፈለ የዝርዝር ክፍያ",
      sellerPayoutProjected: "የእርስዎ 60% ድርሻ",
      systemCutProjected: "የሲስተሙ 40% ድርሻ",
      sellerRegisteredSummary:
        "በጠቅላላው {registered} ተመዝጋቢዎች • {bids} ሚስጥራዊ ጨረታዎች",
      manageAllItemsLink: "ሁሉንም የለጠፏቸውን እቃዎች ይመልከቱ",
      unlockAccessTitle: "የጨረታ መብትን ይክፈቱ",
      unlockAccessDesc:
        "በሚስጥራዊ ጨረታው ለመሳተፍ አነስተኛውን የመግቢያ ክፍያ ይክፈሉ",
      yourWalletBalance: "የዋሌትዎ ሂሳብ",
      payAndRegister: "{fee} ብር ከፍለው ይመዝገቡ",
      processingRegistration: "ምዝገባው በመካሄድ ላይ...",
      topUpWalletBtn: "ዋሌት ይሙሉ",
      secretBidSubmittedTitle: "ሚስጥራዊ ዋጋዎ ገብቷል",
      oneBidLimitReached: "የ1 ዋጋ ገደብ ተጠናቋል",
      yourSealedBid: "የተቆለፈው ሚስጥራዊ ዋጋዎ",
      protocolStatus: "የሲስተሙ ሁኔታ",
      blindEncrypted: "የተመሰጠረና ሚስጥራዊ",
      singleBidRuleNotice:
        "የአንድ ጨረታ ህግ፦ በዚህ መድረክ ላይ ፍትሃዊነትን ለማረጋገጥ እያንዳንዱ ተመዝጋቢ በአንድ ጨረታ ላይ ማስገባት የሚችለው 1 ዋጋ ብቻ ነው። ምርጫዎ እስከ ፍጻሜው ድረስ በሚስጥር ተቆልፎ ይቆያል።",
      submitBlindBidTitle: "ሚስጥራዊ ጨረታዎን ያስገቡ",
      oneBidAvailable: "1 ሚስጥራዊ ዋጋ ማስገባት ይችላሉ",
      bidAmountLabel: "የጨረታ ዋጋ (ብር)",
      oneBidLimitTag: "የ1 ዋጋ ገደብ",
      singleBidRuleReminder:
        "ህግ፦ ለዚህ ጨረታ ማስገባት የሚችሉት 1 ዋጋ ብቻ ነው። በጥንቃቄ ይምረጡ!",
      quickSuggestions: "ፈጣን ምርጫዎች፦",
      submitSecretBidBtn: "ሚስጥራዊ ዋጋዬን አስገባ ({amount} ብር)",
      encryptingBid: "ዋጋውን በሚስጥር በመመዝገብ ላይ...",
      myBidsTitle: "በዚህ ጨረታ ላይ ያስገቧቸው ዋጋዎች ({count})",
      personaLabel: "መለያ፦",
      placedAtTime: "የገባበት ሰዓት {time}",
      winningBidTag: "አሸናፊ ዋጋ!",
      uniqueTag: "ብቸኛ",
      duplicateTag: "የተደገመ (ውድቅ)",
      blindSecretTag: "ሚስጥራዊ / የተደበቀ",
      noBidsPlacedYet:
        "እስካሁን ምንም ዋጋ አላስገቡም። የመጀመሪያውን ሚስጥራዊ ዋጋ ከላይ ያስገቡ!",
      registerToBidPrompt:
        "ሚስጥራዊ ዋጋዎችን ማስገባት ለመጀመር መጀመሪያ ይመዝገቡ።",
      biddingBoxTitle: "ሚስጥራዊ ጨረታዎን ያስገቡ",
      biddingBoxDesc:
        "የሚገምቱትን ዋጋ ያስገቡ። ጨረታው እስኪያበቃ ድረስ ያስገቡት ዋጋ ለማንም ሰው አይታይም።",
      registerRequired:
        "በዚህ ጨረታ ላይ ለመሳተፍ የመግቢያ ክፍያውን መክፈልና መመዝገብ አለብዎት።",
      payAndRegisterBtn: "ክፍያ ፈጽመው ይመዝገቡ",
      registeredActiveNotice: "ተመዝግበዋል! የተፈቀደልዎትን 1 ሚስጥራዊ ዋጋ ያስገቡ፦",
      bidInputPlaceholder: "ለምሳሌ፦ 0.45",
      placeBidBtn: "ሚስጥራዊ ዋጋውን ቆልፍ",
      bidLockedTitle: "ሚስጥራዊ ዋጋዎ ተቆልፏል!",
      bidLockedDesc:
        "{amount} ብር አስገብተዋል። በአንድ ጨረታ ህግ መሰረት ምርጫዎ እስከ ፍጻሜው ድረስ በሚስጥር ተቆልፏል።",
      closedWinnerBanner: "የጨረታው አሸናፊ ተለይቷል!",
      closedWinnerDesc:
        "{username} በ{amount} ብር ዝቅተኛ ብቸኛ ጨረታ ይህንን እቃ አሸንፈዋል!",
      tiedNotice:
        "በዚህ ጨረታ ላይ የቀረቡት ሁሉም ዋጋዎች ተደግመዋል! ብቸኛ ዝቅተኛ ቁጥር አልተገኘም።",
      liveStreamTitle: "የቀጥታ ሚስጥራዊ ጨረታ እንቅስቃሴ",
      liveStreamNotice:
        "ፍትሃዊነትን ለመጠበቅ የጨረታው ዋጋዎች እስከ ፍጻሜው ድረስ ተሸፍነው ይቆያሉ።",
    },

    // Wallet & Telebirr Top-Up
    wallet: {
      modalTitle: "የቴሌብር ዋሌት ክፍያ",
      modalSubtitle: "የጨረታ ሂሳብዎን ለመሙላት በቴሌብር ገንዘብ ያስተላልፉ።",
      depositFunds: "ገንዘብ አስገባ",
      requestStatus: "የጥያቄው ሁኔታ",
      balanceLabel: "የአሁኑ ሂሳብ፦",
      timeLimit: "የጊዜ ገደብ",
      timeLimitDesc:
        "ጥያቄ ከማስገባትዎ በፊት ከታች በተጠቀሰው መረጃ በ10 ደቂቃ ውስጥ በቴሌብር ገንዘብ ያስተላልፉ።",
      step1: "1. በስልክዎ የቴሌብር መተግበሪያን ይክፈቱ",
      step2: "2. ከታች ወደተጠቀሰው የሲስተሙ ቴሌብር ሂሳብ ገንዘብ ይላኩ",
      step3: "3. ከቴሌብር የደረሰዎትን የግብይት ቁጥር (TXN ID) ከታች አስገብተው ያረጋግጡ",
      merchantAccount: "የመድረኩ የቴሌብር ወኪል ሂሳብ",
      accountName: "የተቀባይ ስም",
      accountNumber: "የቴሌ ብር ሂሳብ ቁጥር",
      amountRange: "የገንዘብ መጠን (ከ50.00 እስከ 15,000.00 ብር)፦",
      amountLabel: "የሚሞሉት የገንዘብ መጠን (ብር) *",
      selectAmount: "የሚሞሉትን ገንዘብ መጠን ይምረጡ ወይም ያስገቡ",
      yourPhone: "የእርስዎ የቴሌ ብር ሂሳብ ቁጥር፦",
      senderPhoneLabel: "ገንዘቡን የላኩበት የስልክ ቁጥር *",
      senderPhonePlaceholder: "09XXXXXXXX ወይም 07XXXXXXXX",
      txNumberLabel: "የግብይት ቁጥር (TXN ID) *",
      txNumberPlaceholder: "ለምሳሌ፦ CI9483726190 ወይም የቴሌብር ሜሴጅ ቁጥር",
      fromTelebirrSms: "ከቴሌብር የደረሰዎ አጭር መልዕክት",
      smsHelp:
        "በቴሌብር ክፍያውን ከፈጸሙ በኋላ የግብይት ቁጥሩን እዚህ ያስገቡና ለአድሚን ማረጋገጫ ይላኩ።",
      submitRequestBtn: "ጥያቄውን ላክ",
      submittingRequest: "በማረጋገጥ ላይ...",
      recentRequests: "የቀረቡ የክፍያ ጥያቄዎች",
      noRequestsYet: "እስካሁን የቀረበ የክፍያ ጥያቄ የለም።",
      statusPending: "በማረጋገጥ ላይ (ይጠብቁ)",
      statusApproved: "ተረጋግጦ ገቢ ሆኗል",
      statusRejected: "ውድቅ ተደርጓል",
      requestSubmittedTitle: "የክፍያ ጥያቄዎ ቀርቧል፤ ማረጋገጫ በመጠባበቅ ላይ!",
      requestSubmittedDesc:
        "በግብይት ቁጥር {txn} የ{amount} ብር ጥያቄዎ ተመዝግቧል። አድሚኑ የቴሌብር ዝውውሩን አረጋግጦ ወደ ዋሌትዎ ገቢ ያደርጋል።",
      trackStatus: "ሁኔታውን በታሪክ ዝርዝር ተከታተል",
      newRequest: "አዲስ ጥያቄ አስገባ",
      refreshBtn: "አድስ",
      instantNotice:
        "አድሚኖች የቴሌብር ደረሰኞችን በጥቂት ደቂቃዎች ውስጥ ያረጋግጣሉ። የጸደቀው ገንዘብ ወዲያውኑ ለጨረታ ይውላል።",
      closeBtn: "ዝጋ",
    },

    // Auth (Login / SignUp)
    auth: {
      loginTitle: "ወደ መለያዎ ይግቡ",
      loginSubtitle: "ዋሌትዎን ለመቆጣጠርና በጨረታዎች ለመሳተፍ ይግቡ",
      signupTitle: "አዲስ መለያ ይፍጠሩ",
      signupSubtitle: "በUniqueLow ተመዝግበው አዳዲስ እቃዎችን በርካሽ ያሸንፉ",
      usernameLabel: "የተጠቃሚ ስም (Username)",
      usernamePlaceholder: "የተጠቃሚ ስምዎን ያስገቡ",
      emailLabel: "የኢሜይል አድራሻ",
      emailPlaceholder: "you@example.com",
      phoneLabel: "የቴሌብር ስልክ ቁጥር",
      phonePlaceholder: "09XXXXXXXX ወይም 07XXXXXXXX",
      phoneHelp: "ለቴሌብር ክፍያና ለገንዘብ ወጪ ማረጋገጫ ያስፈልጋል።",
      passwordLabel: "የይለፍ ቃል (Password)",
      passwordPlaceholder: "ቢያንስ 6 ፊደላት ወይም ቁጥሮች",
      confirmPasswordLabel: "የይለፍ ቃሉን ያረጋግጡ",
      accountTypeLabel: "የመለያ አይነት",
      roleUser: "ተጫራች (መደበኛ)",
      roleAdmin: "አድሚን (አስተዳዳሪ)",
      bonusBadge: "የ100.00 ብር ነፃ የመነሻ ስጦታ",
      bonusDesc: "አዲስ ለሚመዘገብ ማንኛውም ሰው 100 ብር የዋሌት ስጦታ ወዲያውኑ ይሰጣል።",
      signInBtn: "ግባ",
      signUpBtn: "መለያ ፍጠር",
      alreadyHaveAccount: "መለያ አለዎት?",
      dontHaveAccount: "መለያ የለዎትም?",
      quickProfilesHeader: "የፈጣን መግቢያ የሙከራ መለያዎች",
      quickProfilesSubtitle: "በአንድ ጠቅታ ለመሞከር (2 አድሚኖችና 5 ተጠቃሚዎች)",
    },

    // Footer
    footer: {
      copyright: "ዩኒክ ሎው የጨረታ ፕሮቶኮል",
      algorithm: "የተረጋገጠ ዝቅተኛ ብቸኛ ጨረታ አልጎሪዝም",
      fairness: "100% ሚስጥራዊና ፍትሃዊ",
      catalog: "ጨረታዎች",
      adminPortal: "የአድሚን ገጽ",
    },
  },
};
