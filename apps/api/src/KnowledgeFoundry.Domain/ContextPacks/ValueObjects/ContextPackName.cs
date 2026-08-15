using KnowledgeFoundry.Domain.Common.Base;

namespace KnowledgeFoundry.Domain.ContextPacks.ValueObjects
{
    public sealed class ContextPackName : ValueObject
    {
        private ContextPackName()
        {
            Value = string.Empty;
        }
        public string Value { get; }

        public ContextPackName(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                throw new ArgumentException(
                    "Context name cannot be empty.",
                    nameof(value));

            if (value.Length > 200)
                throw new ArgumentException(
                    "Context name cannot exceed 200 characters.",
                    nameof(value));

            Value = value.Trim();
        }

        protected override IEnumerable<object?> GetEqualityComponents()
        {
            yield return Value;
        }

        public override string ToString()
            => Value;

        public static implicit operator string(ContextPackName name)
            => name.Value;
    }
}
