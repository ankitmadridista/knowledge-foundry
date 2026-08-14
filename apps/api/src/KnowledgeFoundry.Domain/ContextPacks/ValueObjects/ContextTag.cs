using KnowledgeFoundry.Domain.Common.Base;

namespace KnowledgeFoundry.Domain.ContextPacks.ValueObjects
{
    public sealed class ContextTag : ValueObject
    {
        private ContextTag()
        {
            Value = string.Empty;
        }
        public string Value { get; }

        public ContextTag(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                throw new ArgumentException(
                    "Context tag cannot be empty.",
                    nameof(value));
            }

            value = value.Trim();

            if (value.Length > 50)
            {
                throw new ArgumentException(
                    "Context tag cannot exceed 50 characters.",
                    nameof(value));
            }

            Value = value.ToLowerInvariant();
        }

        protected override IEnumerable<object?> GetEqualityComponents()
        {
            yield return Value;
        }

        public override string ToString()
            => Value;

        public static implicit operator string(ContextTag tag)
            => tag.Value;
    }
}
