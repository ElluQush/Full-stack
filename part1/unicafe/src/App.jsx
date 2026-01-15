  import { useState } from 'react'

  const Button = ({onClick, text}) => <button onClick={onClick}>{text}</button>

  const StatisticsLine = ({text, value}) => {
    if (text === 'positive') {
      return (
        <tr>
          <td>{text}</td> 
          <td>{value} %</td>
        </tr>
      )
    }
    
    return (

      <tr>
        <td>{text}</td> 
        <td>{value} </td>
      </tr>
    )
  }

  const Statistics = ({good, neutral, bad}) => {
    const total = good + neutral + bad
    const average = (good - bad) / total
    const positive = (good / total) * 100

    if (total === 0) return <div>No feedback given</div>

    return (
      <div>
        <table>
          <thead>
            <StatisticsLine text='good' value={good} />
            <StatisticsLine text='neutral' value={neutral} />
            <StatisticsLine text='bad' value={bad} />
            <StatisticsLine text='total' value={total} />
            <StatisticsLine text='average' value={average} />
            <StatisticsLine text='positive' value={positive} />
          </thead>
        </table>
      </div>
    )
  }

  const App = () => {
    // save clicks of each button to its own state
    const [good, setGood] = useState(0)
    const [neutral, setNeutral] = useState(0)
    const [bad, setBad] = useState(0)

    return (
      <div>
        <h1>give feedback</h1>
        <Button onClick={() => setGood(good + 1)} text='good' />
        <Button onClick={() => setNeutral(neutral + 1)} text='neutral' />
        <Button onClick={() => setBad(bad + 1)} text='bad' />
        
        <h1>statistics</h1>
        <Statistics good={good} neutral={neutral} bad={bad} />
      </div>
    )
  }

  export default App