export enum InfoItemType {
  Text = 'text',
  Link = 'link',
  Phone = 'phone',
  Email = 'email',
}

export enum LinkType {
  Instagram = 'instagram',
  Telegram = 'telegram',
  Whatsapp = 'whatsapp',
  Facebook = 'facebook',
  Tiktok = 'tiktok',
  Site = 'site',
  Other = 'other',
}

export enum OpeningHoursDays {
  mon = 'Monday',
  tue = 'Tuesday',
  wed = 'Wednesday',
  thu = 'Thursday',
  fri = 'Friday',
  sat = 'Saturday',
  sun = 'Sunday',
}

export enum OpeningHoursIndexDays {
  mon = 1,
  tue = 2,
  wed = 3,
  thu = 4,
  fri = 5,
  sat = 6,
  sun = 7,
}

export enum OpeningHoursKeysDays {
  mon = 'mon',
  tue = 'tue',
  wed = 'wed',
  thu = 'thu',
  fri = 'fri',
  sat = 'sat',
  sun = 'sun',
}

export enum UserType {
  Shop = 'shop',
  Artist = 'artist',
  Guest = 'guest',
}

export enum InviteType {
  ArtistToShop = 'artist_to_shop',
}

export enum EReactions {
  Pending = 'pending',
  Accepted = 'accepted',
  Rejected = 'rejected',
}

export enum NotificationType {
  RemoveArtistFromShop = 'remove_artist_from_shop',
  AddArtistToShop = 'add_artist_to_shop',
}
