using KnowledgeFoundry.Domain.Common.Base;

namespace KnowledgeFoundry.Domain.ContextPacks.ValueObjects
{
    public sealed class ContextPackIdentifier : ValueObject
    {
        private ContextPackIdentifier()
        {
            Value = string.Empty;
        }
        public string Value { get; }

        public ContextPackIdentifier(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                throw new ArgumentException(
                    "Context identifier cannot be empty.",
                    nameof(value));

            Value = value.Trim().ToUpperInvariant();
        }

        protected override IEnumerable<object?> GetEqualityComponents()
        {
            yield return Value;
        }

        public override string ToString()
            => Value;

        public static implicit operator string(ContextPackIdentifier id)
            => id.Value;
    }
}
