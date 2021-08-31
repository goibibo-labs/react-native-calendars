import _ from 'lodash';
import PropTypes from 'prop-types';
import XDate from 'xdate';
import memoize from 'memoize-one';

import React, {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';

// @ts-expect-error
import {shouldUpdate} from '../../component-updater';
// @ts-expect-error
import {isToday as dateutils_isToday} from '../../dateutils';
// @ts-expect-error
import {xdateToData} from '../../interface';
import {Theme} from 'types';
// @ts-expect-error
import {SELECT_DATE_SLOT} from '../../testIDs';
import BasicDay, {BasicDayProps} from './basic';
import PeriodDay from './period';
import {MarkingProps} from './marking';
import styleConstructor from './../header/style';

const basicDayPropsTypes = _.omit(BasicDay.propTypes, 'date');
const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export interface DayProps extends Omit<BasicDayProps, 'date'> {
  theme?: Theme;
  /** The day to render */
  day?: Date;
  /** Provide custom day rendering component */
  dayComponent?: any;
  /** To show the calendar as a horizontal strip*/
  horizontal?: boolean;
}

export default class Day extends Component<DayProps> {
  static displayName = 'IGNORE';

  static propTypes = {
    ...basicDayPropsTypes,
    theme: PropTypes.object,
    /** The day to render */
    day: PropTypes.object,
    /** Provide custom day rendering component */
    dayComponent: PropTypes.any,
    /** To show the calendar as a horizontal strip*/
    horizontal: PropTypes.bool
  };

  style: any;

  constructor(props: DayProps) {
    super(props);

    this.style = styleConstructor(props.theme);
  }

  shouldComponentUpdate(nextProps: DayProps) {
    return shouldUpdate(this.props, nextProps, [
      'day',
      'dayComponent',
      'state',
      'markingType',
      'marking',
      'onPress',
      'onLongPress'
    ]);
  }

  getMarkingLabel(marking: MarkingProps) {
    let label = '';

    if (marking) {
      if (marking.accessibilityLabel) {
        return marking.accessibilityLabel;
      }

      if (marking.selected) {
        label += 'selected ';
        if (!marking.marked) {
          label += 'You have no entries for this day ';
        }
      }
      if (marking.marked) {
        label += 'You have entries for this day ';
      }
      if (marking.startingDay) {
        label += 'period start ';
      }
      if (marking.endingDay) {
        label += 'period end ';
      }
      if (marking.disabled || marking.disableTouchEvent) {
        label += 'disabled ';
      }
    }
    return label;
  }

  getAccessibilityLabel = memoize((day, marking, isToday) => {
    const today = _.get(XDate, 'locales[XDate.defaultLocale].today');
    const formatAccessibilityLabel = _.get(XDate, 'locales[XDate.defaultLocale].formatAccessibilityLabel');
    const markingLabel = this.getMarkingLabel(marking);

    if (formatAccessibilityLabel) {
      return `${isToday ? today : ''} ${day.toString(formatAccessibilityLabel)} ${markingLabel}`;
    }

    return `${isToday ? 'today' : ''} ${day.toString('dddd d MMMM yyyy')} ${markingLabel}`;
  });

  getDayComponent() {
    const {dayComponent, markingType} = this.props;

    if (dayComponent) {
      return dayComponent;
    }
    return markingType === 'period' ? PeriodDay : BasicDay;
  }

  render() {
    const {day, marking} = this.props;
    const date = xdateToData(day);
    const isToday = dateutils_isToday(day);
    const Component = this.getDayComponent();
    const dayProps = _.omit(this.props, 'day');
    const accessibilityLabel = this.getAccessibilityLabel(day, marking, isToday);

    return (
      <>
        {this.props.horizontal ? (
          <View style={[styles.m8, styles.container]}>
            <Text style={[this.style.dayHeader, styles.mb18]}>{date ? dayNames[day?.getDay() || 0] : day}</Text>
            <Component
              {...dayProps}
              date={date}
              testID={`${SELECT_DATE_SLOT}-${date.dateString}`}
              accessibilityLabel={accessibilityLabel}
            >
              {date ? day?.getDate() : day}
            </Component>
          </View>
        ) : (
          <Component
            {...dayProps}
            date={date}
            testID={`${SELECT_DATE_SLOT}-${date.dateString}`}
            accessibilityLabel={accessibilityLabel}
          >
            {date ? day?.getDate() : day}
          </Component>
        )}
      </>
    );
  }
}

const styles = StyleSheet.create({
  m8: {
    margin: 8
  },
  mb18: {
    marginBottom: 18
  },
  container: {
    flex: 1,
    alignItems: 'center'
  }
});
