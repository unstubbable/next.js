export default function Layout({ slot }) {
  return (
    <div>
      (group)/layout:
      <div className="parallel" title="@slot">
        {slot}
      </div>
    </div>
  )
}
