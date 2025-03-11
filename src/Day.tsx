import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import {
  StyleSheet,
  Text,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
  TextProps,
} from 'react-native'
import { DateTime } from 'luxon'
import Color from './Color'

import { StylePropType, isSameDay } from './utils'
import { DATE_FORMAT } from './Constant'
import { IMessage } from './Models'

/**
 * Helper function to get ordinal suffix for numbers (1st, 2nd, 3rd, etc.)
 */
const getOrdinal = (n: number): string => {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
    marginBottom: 10,
  },
  text: {
    backgroundColor: Color.backgroundTransparent,
    color: Color.defaultColor,
    fontSize: 12,
    fontWeight: '600',
  },
})

export interface DayProps<TMessage extends IMessage> {
  currentMessage?: TMessage
  nextMessage?: TMessage
  previousMessage?: TMessage
  containerStyle?: StyleProp<ViewStyle>
  wrapperStyle?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
  textProps?: TextProps
  dateFormat?: string
  inverted?: boolean
}

export default class Day<
  TMessage extends IMessage = IMessage
> extends PureComponent<DayProps<TMessage>> {
  static contextTypes = {
    getLocale: PropTypes.func,
  }

  static defaultProps = {
    currentMessage: {
      createdAt: null,
    },
    previousMessage: {},
    nextMessage: {},
    containerStyle: {},
    wrapperStyle: {},
    textStyle: {},
    textProps: {},
    dateFormat: DATE_FORMAT,
  }

  static propTypes = {
    currentMessage: PropTypes.object,
    previousMessage: PropTypes.object,
    nextMessage: PropTypes.object,
    inverted: PropTypes.bool,
    containerStyle: StylePropType,
    wrapperStyle: StylePropType,
    textStyle: StylePropType,
    textProps: PropTypes.object,
    dateFormat: PropTypes.string,
  }

  formatDate(createdAt: string | number | Date | undefined): string | null {
    if (!createdAt) return null

    try {
      let dt: DateTime
      if (typeof createdAt === 'string') {
        // Try parsing with Luxon's fromISO first, then fromFormat as fallback
        dt = DateTime.fromISO(createdAt)
        if (!dt.isValid) {
          dt = DateTime.fromFormat(createdAt, 'MMMM d, yyyy h:mm:ss a')
        }
      } else if (typeof createdAt === 'number') {
        dt = DateTime.fromMillis(createdAt)
      } else {
        dt = DateTime.fromJSDate(createdAt)
      }

      if (dt.isValid) {
        const day = dt.day
        return `${dt.toFormat('MMM')} ${getOrdinal(day)}, ${dt.toFormat('yyyy')}`
      }
    } catch (error) {
      console.warn('Error formatting date:', error)
    }
    return null
  }

  render() {
    const {
      currentMessage,
      previousMessage,
      containerStyle,
      wrapperStyle,
      textStyle,
      textProps,
    } = this.props

    if (currentMessage?.createdAt) {
      const dateString = this.formatDate(currentMessage.createdAt)
      
      if (dateString && (!previousMessage || !isSameDay(currentMessage, previousMessage))) {
        return (
          <View style={[styles.container, containerStyle]}>
            <View style={wrapperStyle}>
              <Text style={[styles.text, textStyle]} {...textProps}>
                {dateString}
              </Text>
            </View>
          </View>
        )
      }
    }
    return null
  }
}
