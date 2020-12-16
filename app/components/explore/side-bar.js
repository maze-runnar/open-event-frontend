import { tracked } from '@glimmer/tracking';
import classic from 'ember-classic-decorator';
import Component from '@ember/component';
import moment from 'moment';
import { computed, action } from '@ember/object';
import { not } from '@ember/object/computed';
import { getDateRanges } from 'open-event-frontend/utils/dictionary/filters';

@classic
export default class SideBar extends Component {

  classNames = ['ui', 'fluid', 'explore', 'vertical', 'menu'];

  placeAutocomplete = ["mirzapur India", "sydney cricket ground Australia", "london Europe", "the greate briten England", "Newzland", "cool"];

  customStartDate = moment().toISOString();

  customEndDate = null;
  @tracked showFilters = false;
  isMapVisible = true;
  eventLocationType = null;

  @computed('category', 'sub_category', 'event_type', 'startDate', 'endDate', 'location', 'ticket_type', 'cfs', 'event_name', 'is_online', 'has_logo', 'has_image', 'is_past')
  get hideClearFilters() {
    return !(this.category || this.sub_category || this.event_type || this.startDate || this.endDate || this.location || this.ticket_type || this.cfs || this.event_name || this.is_online || this.has_logo || this.has_image || this.is_past);
  }

  @computed('model')
  get latitude() {
    return this.model?.lat ? this.model.lat : 20;
  }

  @computed('model')
  get longitude() {
    return this.model?.lon ? this.model.lon : 80;
  }

  @computed('category', 'sub_category')
  get showAllCategories() {
    return !this.category || !this.sub_category;
  }

  showAllTypes = not('event_type');

  get dateRanges() {
    return getDateRanges.bind(this)();
  }

  @computed('device.isMobile', 'showFilters')
  get showFiltersOnMobile() {
    return (!this.device.isMobile || this.showFilters);
  }

  @action
  selectLogos(val) {
    this.set('has_logo', this.has_logo === val ? null : val);
  }

  @action
  selectImages(val) {
    this.set('has_image', this.has_image === val ? null : val);
  }

  @action
  async updateLocation(e) {
    const location = e.target.getLatLng();
    const response = this.loader.load(`https://nominatim.openstreetmap.org/reverse?lat=${location.lat}&lon=${location.lng}&format=jsonv2`, { isExternal: true });
    const [cords] = await Promise.all([response]);
    if (cords.address) {
      let locationUpdated = cords.address?.state ? cords.address.state : cords.address.country;
      this.set('location', locationUpdated);
    } else {
      this.set('location', 'singapore');
    }
  }

  @action
  setAutocomplete(place) {
    this.set('location', place);
  }

  @action
  onLocationChangeHandler(lat, lng) {
    this.setProperties({
      zoom: 17,
      lat,
      lng
    });
  }

  @action
  enablePastEvents(val) {
    this.set('startDate', null);
    this.set('endDate', null);
    this.set('dateType', null);
    this.set('is_past', this.is_past === val ? null : val);
  }

  @action
  setLocationType(locationType, val) {
    this.set('is_online', this.eventLocationType === locationType ? null : val);
    this.set('eventLocationType', this.eventLocationType === locationType ? null : locationType);
    this.set('location', null);
  }

  @action
  selectCategory(category, subCategory) {
    this.set('category', (category === this.category && !subCategory) ? null : category);
    this.set('sub_category', (!subCategory || subCategory === this.sub_category) ? null : subCategory);
  }

  @action
  selectEventType(eventType) {
    this.set('event_type', eventType === this.event_type ? null : eventType);
  }

  @action
  selectTicketType(ticketType) {
    this.set('ticket_type', ticketType === this.ticket_type ? null : ticketType);
  }

  @action
  dateValidate(date) {
    if (moment(date).isAfter(this.customEndDate)) {
      this.set('customEndDate', date);
    }
    this.send('selectDateFilter', 'custom_dates');
  }

  @action
  selectEventCfs(cfs) {
    this.set('cfs', cfs === this.cfs ? null : cfs);
  }

  @action
  selectDateFilter(dateType) {
    let newStartDate = null;
    let newEndDate = null;

    if (dateType === this.dateType && dateType !== 'custom_dates') {
      this.set('dateType', null);
    } else {
      this.set('dateType', dateType);
      switch (dateType) {
        case 'custom_dates':
          newStartDate = this.customStartDate;
          newEndDate = this.customEndDate;
          break;

        case 'all_dates':
          break;

        case 'today':
          newStartDate = moment().toISOString();
          newEndDate = moment().toISOString();
          break;

        case 'tomorrow':
          newStartDate = moment().add(1, 'day').toISOString();
          newEndDate = newStartDate;
          break;

        case 'this_week':
          newStartDate = moment().startOf('week').toISOString();
          newEndDate = moment().endOf('week').toISOString();
          break;

        case 'this_weekend':
          newStartDate = moment().isoWeekday('Friday').toISOString();
          newEndDate = moment().isoWeekday('Sunday').toISOString();
          break;

        case 'next_week':
          newStartDate = moment().isoWeekday('Monday').add(1, 'week').toISOString();
          newEndDate = moment().isoWeekday('Sunday').add(1, 'week').toISOString();
          break;

        case 'this_month':
          newStartDate = moment().startOf('month').toISOString();
          newEndDate = moment().endOf('month').toISOString();
          break;

        default:
      }
    }
    this.set('startDate', newStartDate);
    this.set('endDate', newEndDate);
    this.set('is_past', null);
  }

  @action
  onDateChange() {
    this.send('selectDateFilter', 'custom_dates');
  }

  @action
  clearFilterCategory() {
    this.setProperties({
      category     : null,
      sub_category : null
    });

  }

  @action
  clearFilterTypes() {
    this.set('event_type', null);
  }

  @action
  clearFilters() {
    this.setProperties({
      startDate         : null,
      endDate           : null,
      dateType          : null,
      category          : null,
      sub_category      : null,
      event_type        : null,
      location          : null,
      ticket_type       : null,
      cfs               : null,
      event_name        : null,
      is_online         : null,
      has_logo          : null,
      has_image         : null,
      is_past           : null,
      eventLocationType : null
    });
  }

  @action
  toggleFilters() {
    this.set('showFilters', !this.showFilters);
  }

  @action
  toggleMap() {
    this.toggleProperty('isMapVisible');
  }
}
